'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

type CreateNoteModalProps = {
  open: boolean
  onClose: () => void
  onCreate: (title: string) => Promise<void>
}

export function CreateNoteModal({ open, onClose, onCreate }: CreateNoteModalProps) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  // Сбрасываем поле при каждом открытии
  useEffect(() => {
    if (open) {
      setTitle('')
      setLoading(false)
    }
  }, [open])

  // Закрытие по Esc
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
    const trimmed = title.trim() || 'Новая Заметка'
    setLoading(true)
    await onCreate(trimmed)
    setLoading(false)
    onClose()
  }

  return (
    // Затемнённый фон
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Само окно */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Новая заметка
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400"
            title="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Название
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Новая Заметка"
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-950 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            />
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
              disabled={loading}
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