'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

type CreateTaskModalProps = {
  open: boolean
  onClose: () => void
  onCreate: (text: string, time: string | null) => Promise<void>
  /** Если задано — время предзаполнено (например, "14:00") */
  presetTime?: string | null
}

export function CreateTaskModal({
  open,
  onClose,
  onCreate,
  presetTime = null,
}: CreateTaskModalProps) {
  const [text, setText] = useState('')
  const [time, setTime] = useState<string>(presetTime ?? '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setText('')
      setTime(presetTime ?? '')
      setLoading(false)
    }
  }, [open, presetTime])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    setLoading(true)
    await onCreate(trimmed, time || null)
    setLoading(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Новая задача
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Текст задачи
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Например: Позвонить маме"
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-950 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Время (опционально)
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-950 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            >
              <option value="">Без времени</option>
              {generateHours().map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="px-4 py-2 text-sm rounded-md bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-80 disabled:opacity-50"
            >
              {loading ? 'Создаём...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Генерация часов от 6:00 до 2:00 (следующего дня)
function generateHours(): string[] {
  const hours: string[] = []
  // 6:00 - 23:00
  for (let h = 6; h <= 23; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`)
  }
  // 0:00 - 2:00
  for (let h = 0; h <= 2; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`)
  }
  return hours
}