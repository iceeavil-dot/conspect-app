'use client'

import { Plus, Clock } from 'lucide-react'
import type { PlannerTask } from '@/lib/planner'

type TimeTableProps = {
  tasks: PlannerTask[]
  onAddAtHour: (hour: string) => void
  onTaskClick?: (task: PlannerTask) => void
}

// Часы от 6:00 до 2:00 (следующего дня)
function getHours(): string[] {
  const hours: string[] = []
  for (let h = 6; h <= 23; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`)
  }
  for (let h = 0; h <= 2; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`)
  }
  return hours
}

// Преобразование "HH:MM" в минуты от начала дня.
// Учитываем, что после полуночи идёт следующий день.
function timeToMinutes(time: string, baseHour = 6): number {
  const [h, m] = time.split(':').map(Number)
  let hours = h
  if (h < baseHour) hours = 24 + h
  return hours * 60 + m
}

export function TimeTable({ tasks, onAddAtHour, onTaskClick }: TimeTableProps) {
  const hours = getHours()

  // Собираем карту: какой час перекрыт каким событием
  // ВАЖНО: end_time ВКЛЮЧИТЕЛЬНО (15:00 = последний час)
  function getBlockMap() {
    const map: Record<
      string,
      { task: PlannerTask; isStart: boolean } | undefined
    > = {}

    const events = tasks.filter((t) => t.is_event && t.time)

    for (const ev of events) {
      const startMin = timeToMinutes(ev.time!)
      const endMin = ev.end_time
        ? timeToMinutes(ev.end_time)
        : startMin + 60 // по умолчанию 1 час

      for (const h of hours) {
        const hMin = timeToMinutes(h)
        // <= — потому что end_time ВКЛЮЧИТЕЛЬНО
        if (hMin >= startMin && hMin <= endMin) {
          const isStart = h === ev.time
          map[h] = { task: ev, isStart }
        }
      }
    }

    return map
  }

  const blockMap = getBlockMap()

  // Задачи (не события) — отдельно, в строке времени
  function getTasksAtHour(hour: string): PlannerTask[] {
    return tasks.filter((t) => t.time === hour && !t.is_event)
  }

  return (
    <div className="border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden">
      {/* Заголовок */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Time Table
        </h3>
      </div>

      {/* Часы */}
      <div className="divide-y divide-gray-100 dark:divide-neutral-900">
        {hours.map((hour) => {
          const hourTasks = getTasksAtHour(hour)
          const eventBlock = blockMap[hour]

          // Если в этот час есть событие
          if (eventBlock) {
            const ev = eventBlock.task
            const isStart = eventBlock.isStart
            const timeLabel = ev.end_time
              ? `${ev.time}–${ev.end_time}`
              : ev.time

            return (
              <div
                key={hour}
                className="flex items-stretch min-h-[36px] bg-gray-100 dark:bg-neutral-900"
              >
                {/* Время */}
                <div className="w-16 shrink-0 px-3 py-1 text-xs text-gray-500 dark:text-gray-500 tabular-nums flex items-start">
                  {hour}
                </div>

                {/* Тело события */}
                <div className="flex-1 px-2 py-1 flex items-center gap-2">
                  {isStart ? (
                    <div className="flex items-center gap-2 text-sm text-black dark:text-white">
                      <Clock
                        size={14}
                        className="text-gray-500 dark:text-gray-400 shrink-0"
                      />
                      <span className="font-medium">{ev.text}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-500 tabular-nums">
                        {timeLabel}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full" />
                  )}
                </div>
              </div>
            )
          }

          // Обычный час (без события)
          return (
            <div
              key={hour}
              className="group flex items-stretch min-h-[36px] hover:bg-gray-50 dark:hover:bg-neutral-950"
            >
              <div className="w-16 shrink-0 px-3 py-1 text-xs text-gray-500 dark:text-gray-500 tabular-nums flex items-start">
                {hour}
              </div>

              <div className="flex-1 px-2 py-1 flex items-start gap-2 flex-wrap">
                {hourTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick?.(task)}
                    className={`text-sm px-2 py-0.5 rounded-md transition-colors ${
                      task.done
                        ? 'text-gray-400 dark:text-gray-600 line-through'
                        : 'text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {task.text}
                  </button>
                ))}
              </div>

              <div className="shrink-0 flex items-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onAddAtHour(hour)}
                  className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400"
                  title={`Добавить задачу на ${hour}`}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}