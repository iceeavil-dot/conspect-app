import { createClient } from './supabase/client'
import type { PlannerTask } from './planner'

// Для удобства — тот же тип, но с уточнением
export type CalendarItem = PlannerTask

// ─────────────────────────────────────────────────────────────
// Получить все элементы календаря за месяц
// (только те, что созданы в календаре: show_in_calendar = true)
// ─────────────────────────────────────────────────────────────

export async function getMonthItems(
  year: number,
  month: number // 0-indexed
): Promise<CalendarItem[]> {
  const supabase = createClient()

  // Первый день месяца
  const fromDate = formatDate(new Date(year, month, 1))
  // Последний день месяца
  const lastDay = new Date(year, month + 1, 0).getDate()
  const toDate = formatDate(new Date(year, month, lastDay))

  const { data, error } = await supabase
    .from('planner_tasks')
    .select('*')
    .eq('show_in_calendar', true)
    .gte('date', fromDate)
    .lte('date', toDate)
    .order('date', { ascending: true })
    .order('time', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Ошибка загрузки элементов календаря:', error)
    return []
  }

  return data ?? []
}

// ─────────────────────────────────────────────────────────────
// Создать событие
// ─────────────────────────────────────────────────────────────

export async function createEvent(
  date: string, // YYYY-MM-DD
  text: string,
  time: string, // "12:00"
  endTime: string // "15:00"
): Promise<CalendarItem | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('planner_tasks')
    .insert({
      user_id: user.id,
      date,
      text: text.trim(),
      time,
      end_time: endTime,
      is_event: true,
      show_in_calendar: true,
      done: false,
      priority: 'none',
    })
    .select()
    .single()

  if (error) {
    console.error('Ошибка создания события:', error)
    return null
  }

  return data
}

// ─────────────────────────────────────────────────────────────
// Создать задачу (в календаре)
// ─────────────────────────────────────────────────────────────

export async function createCalendarTask(
  date: string,
  text: string,
  time?: string | null,
  priority: 'none' | 'yellow' | 'red' = 'none'
): Promise<CalendarItem | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('planner_tasks')
    .insert({
      user_id: user.id,
      date,
      text: text.trim(),
      time: time ?? null,
      end_time: null,
      is_event: false,
      show_in_calendar: true, // ← ключевое: показывается в календаре
      priority,
    })
    .select()
    .single()

  if (error) {
    console.error('Ошибка создания задачи в календаре:', error)
    return null
  }

  return data
}

// ─────────────────────────────────────────────────────────────
// Удалить элемент календаря
// (используется та же функция deleteTask, но оставим свою для ясности)
// ─────────────────────────────────────────────────────────────

export async function deleteCalendarItem(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('planner_tasks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Ошибка удаления элемента:', error)
    return false
  }

  return true
}

// ─────────────────────────────────────────────────────────────
// Утилита
// ─────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
// ─────────────────────────────────────────────────────────────
// Обновить элемент календаря
// ─────────────────────────────────────────────────────────────

export async function updateCalendarItem(
  id: string,
  updates: {
    text?: string
    time?: string | null
    end_time?: string | null
    priority?: 'none' | 'yellow' | 'red'
  }
): Promise<boolean> {
  const supabase = createClient()

  const payload: Record<string, any> = {}
  if (updates.text !== undefined) payload.text = updates.text.trim()
  if (updates.time !== undefined) payload.time = updates.time
  if (updates.end_time !== undefined) payload.end_time = updates.end_time
  if (updates.priority !== undefined) payload.priority = updates.priority

  const { error } = await supabase
    .from('planner_tasks')
    .update(payload)
    .eq('id', id)

  if (error) {
    console.error('Ошибка обновления элемента:', error)
    return false
  }

  return true
}