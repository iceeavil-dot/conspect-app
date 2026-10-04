'use client'

import { useState, useEffect } from 'react'
import { X, Clock, CheckSquare } from 'lucide-react'

type ItemType = 'event' | 'task'

type CreateItemModalProps = {
  open: boolean
  /** Дата в формате YYYY-MM-DD */
  date: string
  onClose: () => void
  onCreateEvent: (text: string, time: string, endTime: string) => Promise<void>
  onCreateTask: (
    text: string,
    time: string | null,
    priority: 'none' | 'yellow' | 'red'
  ) => Promise<void>
}

// Часы от 6:00 до 2:00 (как в планере)
function generateHours(): string[] {
  const hours: string[] = []
  for (let h = 6; h <= 23; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`)
  }
  for (let h = 0; h <= 2; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`)
  }
  return hours
}

// Красивая дата
function formatDateHuman(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export function CreateItemModal({
  open,
  date,
  onClose,
  onCreateEvent,
  onCreateTask,
}: CreateItemModalProps) {
  const [type, setType] = useState<ItemType>('task')
  const [text, setText] = useState('')
  const [time, setTime] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')
  const [priority, setPriority] = useState<'none' | 'yellow' | 'red'>('none')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Сброс при открытии
  useEffect(() => {
    if (open) {
      setType('task')
      setText('')
      setTime('')
      setEndTime('')
      setPriority('none')
      setLoading(false)
      setError('')
    }
  }, [open])

  // Esc для закрытия
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const hours = generateHours()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmed = text.trim()
    if (!trimmed) {
      setError('Введи текст')
      return
    }

    // Валидация события
    if (type === 'event') {
      if (!time) {
        setError('Для события нужно время начала')
        return
      }
      if (!endTime) {
        setError('Для события нужно время окончания')
        return
      }
      // Проверка: конец должен быть после начала
      if (endTime === time) {
        setError('Конец должен быть позже начала')
        return
      }
    }

    setLoading(true)

    try {
      if (type === 'event') {
        await onCreateEvent(trimmed, time, endTime)
      } else {
        await onCreateTask(trimmed, time || null, priority)
      }
      onClose()
    } catch (err) {
      setError('Ошибка при создании')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-xl"
      >
        {/* Шапка */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Новое
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

        {/* Переключатель типа */}
        <div className="px-5 pt-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('task')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                type === 'task'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-950'
              }`}
            >
              <CheckSquare size={16} />
              Задача
            </button>
            <button
              type="button"
              onClick={() => setType('event')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                type === 'event'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-950'
              }`}
            >
              <Clock size={16} />
              Событие
            </button>
          </div>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Текст */}
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Название
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={type === 'event' ? 'Встреча' : 'Купить хлеб'}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-950 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Время */}
          <div className={type === 'event' ? 'grid grid-cols-2 gap-3' : ''}>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                {type === 'event' ? 'Начало' : 'Время (опционально)'}
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-950 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              >
                <option value="">
                  {type === 'event' ? '— выбери —' : 'Без времени'}
                </option>
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {type === 'event' && (
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                  Конец
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-950 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                >
                  <option value="">— выбери —</option>
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Приоритет — только для задачи */}
          {type === 'task' && (
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                Приоритет
              </label>
              <div className="flex gap-2">
                {(['none', 'yellow', 'red'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-md text-sm transition-colors ${
                      priority === p
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-950'
                    }`}
                  >
                    {p === 'none' && '— без'}
                    {p === 'yellow' && '🟡 жёлтый'}
                    {p === 'red' && '🔴 красный'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ошибка */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Кнопки */}
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