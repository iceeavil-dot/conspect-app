'use client'

import { Plus } from 'lucide-react'
import type { PlannerTask } from '@/lib/planner'

type TimeTableProps = {
  /** Все задачи на текущий день */
  tasks: PlannerTask[]
  /** Клик по часу или кнопке "+" — создать задачу с этим временем */
  onAddAtHour: (hour: string) => void
  /** Клик по задаче — открыть редактирование (пока ничего) */
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

export function TimeTable({ tasks, onAddAtHour, onTaskClick }: TimeTableProps) {
  const hours = getHours()

  // Группируем задачи по времени
  function getTasksAtHour(hour: string): PlannerTask[] {
    return tasks.filter((t) => t.time === hour)
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
          const hasTasks = hourTasks.length > 0

          return (
            <div
              key={hour}
              className="group flex items-stretch min-h-[36px] hover:bg-gray-50 dark:hover:bg-neutral-950"
            >
              {/* Время */}
              <div className="w-16 shrink-0 px-3 py-1 text-xs text-gray-500 dark:text-gray-500 tabular-nums flex items-start">
                {hour}
              </div>

              {/* Задачи в этот час */}
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

              {/* Кнопка "+" (видна при hover или всегда — пока всегда) */}
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