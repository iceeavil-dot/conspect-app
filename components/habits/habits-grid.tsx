'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HabitRow } from './habit-row'
import {
  getDaysInMonth,
  getFirstWeekdayOfMonth,
  formatDate,
  MONTHS_RU,
  WEEKDAYS_RU,
} from '@/lib/habits-colors'
import {
  getHabits,
  getHabitLogs,
  toggleHabitLog,
  renameHabit,
  deleteHabit,
  type Habit,
  type HabitLog,
} from '@/lib/habits'

type HabitsGridProps = {
  disableFuture?: boolean
}

export function HabitsGrid({ disableFuture = true }: HabitsGridProps) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const daysInMonth = getDaysInMonth(year, month)
  const firstWeekday = getFirstWeekdayOfMonth(year, month)
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
  const maxDay = isCurrentMonth ? today.getDate() : daysInMonth

  const load = useCallback(async () => {
    setLoading(true)
    const fromDate = formatDate(year, month, 1)
    const toDate = formatDate(year, month, daysInMonth)

    const [habitsData, logsData] = await Promise.all([
      getHabits(),
      getHabitLogs(fromDate, toDate),
    ])

    setHabits(habitsData)
    setLogs(logsData)
    setLoading(false)
  }, [year, month, daysInMonth])

  useEffect(() => {
    load()
  }, [load])

  function handlePrevMonth() {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  function handleNextMonth() {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  async function handleToggleDay(habitId: string, day: number) {
    const dateStr = formatDate(year, month, day)
    const existing = logs.find((l) => l.habit_id === habitId && l.date === dateStr)
    const newValue = existing ? !existing.done : true

    setLogs((prev) => {
      const filtered = prev.filter(
        (l) => !(l.habit_id === habitId && l.date === dateStr)
      )
      return [
        ...filtered,
        {
          id: existing?.id ?? '',
          habit_id: habitId,
          user_id: '',
          date: dateStr,
          done: newValue,
        },
      ]
    })

    const ok = await toggleHabitLog(habitId, dateStr, newValue)
    if (!ok) load()
  }

  async function handleRename(habitId: string, currentName: string) {
    const newName = window.prompt('Новое название привычки:', currentName)
    if (!newName || newName.trim() === '' || newName === currentName) return

    const ok = await renameHabit(habitId, newName.trim())
    if (ok) {
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? { ...h, name: newName.trim() } : h))
      )
    } else {
      alert('Не удалось переименовать')
    }
  }

  async function handleDelete(habitId: string, name: string) {
    const confirmed = window.confirm(
      `Удалить привычку «${name}»? Все отметки будут тоже удалены.`
    )
    if (!confirmed) return

    const ok = await deleteHabit(habitId)
    if (ok) {
      setHabits((prev) => prev.filter((h) => h.id !== habitId))
      setLogs((prev) => prev.filter((l) => l.habit_id !== habitId))
    } else {
      alert('Не удалось удалить')
    }
  }

  function getDayProductivity(day: number): number {
    if (habits.length === 0) return 0
    const dateStr = formatDate(year, month, day)
    const doneCount = logs.filter((l) => l.date === dateStr && l.done).length
    return Math.round((doneCount / habits.length) * 100)
  }

  if (loading) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 py-8">
        Загрузка...
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-500 py-12 text-center">
        Пока нет привычек. Нажми «+», чтобы добавить первую.
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      {/* Заголовок: месяц + навигация */}
      <div className="flex items-center justify-between mb-4 px-2">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white"
        >
          <ChevronLeft size={18} />
        </button>

        <h2 className="text-base font-medium text-black dark:text-white">
          {MONTHS_RU[month]} {year}
        </h2>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="min-w-fit">
        {/* Заголовок с числами дней */}
        <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-neutral-800 mb-1">
          <div className="w-40 shrink-0 px-2 text-xs text-gray-500 dark:text-gray-400">
            Привычка
          </div>

          <div className="flex gap-0.5 flex-1">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const weekday = (firstWeekday + i) % 7
              return (
                <div
                  key={day}
                  className="w-8 text-center text-[10px] text-gray-500 dark:text-gray-500 leading-tight"
                >
                  <div className="opacity-60">{WEEKDAYS_RU[weekday]}</div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">
                    {day}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="w-12 shrink-0 text-right text-[10px] text-gray-500 dark:text-gray-500 pr-2">
            %
          </div>
        </div>

        {/* Строки привычек */}
        <div>
          {habits.map((habit) => {
            const habitLogs = logs.filter((l) => l.habit_id === habit.id)
            return (
              <HabitRow
                key={habit.id}
                habit={habit}
                daysInMonth={daysInMonth}
                year={year}
                month={month}
                logs={habitLogs}
                maxDay={disableFuture ? maxDay : undefined}
                onToggleDay={(day) => handleToggleDay(habit.id, day)}
                onRename={() => handleRename(habit.id, habit.name)}
                onDelete={() => handleDelete(habit.id, habit.name)}
              />
            )
          })}
        </div>

        {/* Числа продуктивности внизу */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-neutral-800 mt-1">
          <div className="w-40 shrink-0 px-2 text-xs text-gray-500 dark:text-gray-400">
            Продуктивность
          </div>

          <div className="flex gap-0.5 flex-1">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const percent = getDayProductivity(day)
              return (
                <div
                  key={day}
                  className="w-8 text-center text-[10px] text-gray-600 dark:text-gray-400 tabular-nums"
                >
                  {percent > 0 ? percent : ''}
                </div>
              )
            })}
          </div>

          <div className="w-12 shrink-0" />
        </div>
      </div>
    </div>
  )
}