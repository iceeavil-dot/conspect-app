import { createClient } from './supabase/client'

// ─────────────────────────────────────────────────────────────
// Типы
// ─────────────────────────────────────────────────────────────

export type DayStats = {
  date: string                  // YYYY-MM-DD
  // Привычки
  habitsDone: number
  habitsTotal: number
  habitsPercent: number
  // Задачи Планера
  tasksDone: number
  tasksTotal: number
  tasksPercent: number
  // Общий балл (взвешенный)
  totalPercent: number
  // Списки для UI
  doneItems: string[]           // названия выполненных (привычки + задачи)
  notDoneItems: string[]        // названия невыполненных
  // Соотношение секторов для donut
  habitShare: number            // сколько % круга занимают привычки (0-100)
  taskShare: number             // сколько % круга занимают задачи (0-100)
}

// ─────────────────────────────────────────────────────────────
// Утилиты
// ─────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ─────────────────────────────────────────────────────────────
// Продуктивность за один день
// ─────────────────────────────────────────────────────────────

export async function getDayStats(dateStr: string): Promise<DayStats> {
  const supabase = createClient()

  // Параллельно: привычки + их логи + задачи планера
  const [habitsRes, habitLogsRes, tasksRes] = await Promise.all([
    supabase.from('habits').select('id, name'),
    supabase
      .from('habit_logs')
      .select('habit_id, done')
      .eq('date', dateStr)
      .eq('done', true),
    supabase
      .from('planner_tasks')
      .select('text, done')
      .eq('date', dateStr),
  ])

  const habits = habitsRes.data ?? []
  const doneHabitIds = new Set((habitLogsRes.data ?? []).map((l) => l.habit_id))
  const tasks = tasksRes.data ?? []

  // Привычки
  const habitsTotal = habits.length
  const habitsDone = doneHabitIds.size
  const habitsPercent =
    habitsTotal > 0 ? Math.round((habitsDone / habitsTotal) * 100) : 0

  // Задачи
  const tasksTotal = tasks.length
  const tasksDone = tasks.filter((t) => t.done).length
  const tasksPercent =
    tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0

  // Общий (взвешенный)
  const totalItems = habitsTotal + tasksTotal
  const doneItemsCount = habitsDone + tasksDone
  const totalPercent =
    totalItems > 0 ? Math.round((doneItemsCount / totalItems) * 100) : 0

  // Списки
  const doneHabits: string[] = habits
    .filter((h) => doneHabitIds.has(h.id))
    .map((h) => h.name)
  const notDoneHabits: string[] = habits
    .filter((h) => !doneHabitIds.has(h.id))
    .map((h) => h.name)

  const doneTasks: string[] = tasks
    .filter((t) => t.done)
    .map((t) => t.text)
  const notDoneTasks: string[] = tasks
    .filter((t) => !t.done)
    .map((t) => t.text)

  const doneItems = [...doneHabits, ...doneTasks]
  const notDoneItems = [...notDoneHabits, ...notDoneTasks]

  // Доли для donut (пропорционально количеству, из общего числа)
  // habitShare + taskShare + пустота = 100%
  const habitShare = totalItems > 0 ? (habitsDone / totalItems) * 100 : 0
  const taskShare = totalItems > 0 ? (tasksDone / totalItems) * 100 : 0

  return {
    date: dateStr,
    habitsDone,
    habitsTotal,
    habitsPercent,
    tasksDone,
    tasksTotal,
    tasksPercent,
    totalPercent,
    doneItems,
    notDoneItems,
    habitShare,
    taskShare,
  }
}

// ─────────────────────────────────────────────────────────────
// Статистика за предыдущий день (для сравнения)
// ─────────────────────────────────────────────────────────────

export async function getPreviousDayStats(
  dateStr: string
): Promise<DayStats> {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() - 1)
  return getDayStats(formatDate(d))
}

// ─────────────────────────────────────────────────────────────
// Streak: серия дней подряд с продуктивностью ≥ threshold
// ─────────────────────────────────────────────────────────────

export async function getStreak(
  endDateStr: string,
  threshold = 80
): Promise<number> {
  let streak = 0
  let cursor = new Date(endDateStr + 'T00:00:00')

  // Ограничение — 365 итераций, чтобы не уйти в бесконечность
  for (let i = 0; i < 365; i++) {
    const dateStr = formatDate(cursor)
    const stats = await getDayStats(dateStr)

    if (stats.totalPercent >= threshold && stats.habitsTotal + stats.tasksTotal > 0) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

// ─────────────────────────────────────────────────────────────
// Статистика за неделю (7 дней) начиная с startDate
// ─────────────────────────────────────────────────────────────

export type PeriodStats = {
  date: string
  percent: number
}

export async function getWeekStats(
  startDateStr: string
): Promise<PeriodStats[]> {
  const result: PeriodStats[] = []
  const start = new Date(startDateStr + 'T00:00:00')

  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const dateStr = formatDate(d)
    const stats = await getDayStats(dateStr)
    result.push({ date: dateStr, percent: stats.totalPercent })
  }

  return result
}

// ─────────────────────────────────────────────────────────────
// Статистика за месяц (все дни) — текущий + прошлый
// ─────────────────────────────────────────────────────────────

export type MonthStats = {
  current: PeriodStats[]
  previous: PeriodStats[]
}

export async function getMonthStats(
  year: number,
  month: number // 0-indexed
): Promise<MonthStats> {
  const current = await getMonthDaysStats(year, month)

  // Прошлый месяц
  let prevYear = year
  let prevMonth = month - 1
  if (prevMonth < 0) {
    prevMonth = 11
    prevYear--
  }
  const previous = await getMonthDaysStats(prevYear, prevMonth)

  return { current, previous }
}

async function getMonthDaysStats(
  year: number,
  month: number
): Promise<PeriodStats[]> {
  const result: PeriodStats[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day)
    const dateStr = formatDate(d)
    const stats = await getDayStats(dateStr)
    result.push({ date: dateStr, percent: stats.totalPercent })
  }

  return result
}