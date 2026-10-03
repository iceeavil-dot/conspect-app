'use client'

import { HabitDiamond } from './habit-diamond'
import { HabitRowMenu } from './habit-row-menu'
import { getDayColor } from '@/lib/habits-colors'
import type { Habit, HabitLog } from '@/lib/habits'

type HabitRowProps = {
  habit: Habit
  daysInMonth: number
  year: number
  month: number
  logs: HabitLog[]
  onToggleDay: (day: number) => void
  onRename: () => void
  onDelete: () => void
  maxDay?: number
}

export function HabitRow({
  habit,
  daysInMonth,
  year,
  month,
  logs,
  onToggleDay,
  onRename,
  onDelete,
  maxDay,
}: HabitRowProps) {
  function isDoneOnDay(day: number): boolean {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const log = logs.find((l) => l.date === dateStr)
    return log?.done ?? false
  }

  const doneCount = logs.filter((l) => l.done).length
  const percent = daysInMonth > 0 ? Math.round((doneCount / daysInMonth) * 100) : 0

  return (
    <div className="group flex items-center gap-2 py-1 border-b border-gray-100 dark:border-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-950">
      {/* Название привычки + меню */}
      <div className="w-40 shrink-0 px-2 flex items-center gap-1">
        <span className="text-sm text-black dark:text-white truncate flex-1">
          {habit.name}
        </span>
        <HabitRowMenu onRename={onRename} onDelete={onDelete} />
      </div>

      {/* Клетки по дням */}
      <div className="flex gap-0.5 flex-1">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const isFuture = maxDay !== undefined && day > maxDay
          return (
            <HabitDiamond
              key={day}
              day={day}
              done={isDoneOnDay(day)}
              color={getDayColor(day)}
              onClick={() => onToggleDay(day)}
              disabled={isFuture}
            />
          )
        })}
      </div>

      {/* Процент справа */}
      <div className="w-12 shrink-0 text-right text-xs text-gray-500 dark:text-gray-400 tabular-nums pr-2">
        {percent}
      </div>
    </div>
  )
}