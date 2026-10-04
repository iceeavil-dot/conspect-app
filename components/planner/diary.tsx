'use client'

import { useEffect, useState, useRef } from 'react'
import { getDayNote, saveDayNote } from '@/lib/planner'

type DiaryProps = {
  /** Дата в формате YYYY-MM-DD */
  date: string
}

export function Diary({ date }: DiaryProps) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  const lastSavedRef = useRef<string>('')

  // Загрузка при смене даты
  useEffect(() => {
    setLoading(true)
    setSavedAt(null)
    lastSavedRef.current = ''
    getDayNote(date).then((text) => {
      setNote(text)
      lastSavedRef.current = text
      setLoading(false)
    })
  }, [date])

  // Автосохранение с debounce 800мс
  useEffect(() => {
    if (loading) return
    if (note === lastSavedRef.current) return

    const timer = setTimeout(async () => {
      setSaving(true)
      const ok = await saveDayNote(date, note)
      if (ok) {
        lastSavedRef.current = note
        setSavedAt(new Date())
      }
      setSaving(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [note, date, loading])

  return (
    <div className="border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden">
      {/* Заголовок */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Дневник
        </h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {saving && 'Сохранение…'}
          {!saving && savedAt && '✓ Сохранено'}
        </span>
      </div>

      {/* Textarea */}
      <div className="p-3">
        {loading ? (
          <div className="h-32 flex items-center justify-center text-sm text-gray-400 dark:text-gray-600">
            Загрузка...
          </div>
        ) : (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Запиши, как прошёл день…"
            className="w-full min-h-[140px] resize-y bg-transparent text-sm text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none leading-relaxed"
          />
        )}
      </div>
    </div>
  )
}