'use client'

import { Check } from 'lucide-react'
import { TaskRow } from './task-row'
import type { PlannerTask } from '@/lib/planner'

type TaskListProps = {
  tasks: PlannerTask[]
  onToggleDone: (id: string, done: boolean) => void
  onCyclePriority: (id: string, current: 'none' | 'yellow' | 'red') => void
  onDelete: (id: string, text: string) => void
}

export function TaskList({
  tasks,
  onToggleDone,
  onCyclePriority,
  onDelete,
}: TaskListProps) {
  // Только задачи без времени — они идут в список
  // (задачи с временем — в Time Table, но мы их тоже покажем в списке)
  return (
    <div className="border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden">
      {/* Заголовок */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          To-do на сегодня
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-500">
          {tasks.filter((t) => t.done).length} / {tasks.length}
        </span>
      </div>

      {/* Список */}
      {tasks.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-600">
          Пока нет дел. Нажми «+ Дело», чтобы добавить.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-neutral-900">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggleDone={() => onToggleDone(task.id, !task.done)}
              onCyclePriority={() => onCyclePriority(task.id, task.priority)}
              onDelete={() => onDelete(task.id, task.text)}
            />
          ))}
        </div>
      )}
    </div>
  )
}