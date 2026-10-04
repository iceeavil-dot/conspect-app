'use client'

import { X } from 'lucide-react'
import type { CalendarItem } from '@/lib/calendar'

type DayItemsModalProps = {
  open: boolean
  date: string
  items: CalendarItem[]
  onClose: () => void
  onPickItem: (item: CalendarItem) => void
}

function formatDateHuman(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export function DayItemsModal({
  open,
  date,
  items,
  onClose,
  onPickItem,
}: DayItemsModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-xl max-h-[80vh] overflow-y-auto"
      >
        {/* Шапка */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
          <div>
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Все дела
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              {formatDateHuman(date)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Список */}
        <div className="p-3">
          {items.length === 0 ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-600 py-6">
              Нет дел
            </p>
          ) : (
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onPickItem(item)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 mt-0.5">
                        {item.is_event ? '🕐' : '☐'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-black dark:text-white truncate">
                          {item.text}
                        </div>
                        {(item.time || item.end_time) && (
                          <div className="text-xs italic text-gray-500 dark:text-gray-500 mt-0.5 tabular-nums">
                            {item.time}
                            {item.end_time && `–${item.end_time}`}
                          </div>
                        )}
                      </div>
                      {item.priority !== 'none' && (
                        <span className="shrink-0 mt-1 text-xs">
                          {item.priority === 'red' ? '🔴' : '🟡'}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}