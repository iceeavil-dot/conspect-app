'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Star, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NoteCanvas } from '@/components/editor/note-canvas'

type Note = {
  id: string
  title: string
  content: string
  canvas_data: string | null
  is_favorite: boolean
  updated_at: string
}

export default function NoteEditorPage() {
  const router = useRouter()
  const params = useParams()
  const noteId = params.id as string

  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [canvasData, setCanvasData] = useState<string | null>(null)
  const [mode, setMode] = useState<'text' | 'canvas'>('text')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  // Загрузка заметки
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single()

      if (error || !data) {
        router.push('/notes')
        return
      }

      setNote(data)
      setTitle(data.title)
      setContent(data.content ?? '')
      setCanvasData(data.canvas_data ?? null)
      setLoading(false)
    }
    load()
  }, [noteId, router])

  // Сохранение
  const save = useCallback(
    async (
      newTitle: string,
      newContent: string,
      newCanvas: string | null
    ) => {
      if (!noteId) return
      setSaving(true)
      const supabase = createClient()
      const { error } = await supabase
        .from('notes')
        .update({
          title: newTitle,
          content: newContent,
          canvas_data: newCanvas,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId)

      if (!error) {
        setSavedAt(new Date())
      }
      setSaving(false)
    },
    [noteId]
  )

  // Автосохранение текста (с задержкой 800мс)
  useEffect(() => {
    if (loading || !note) return
    if (title === note.title && content === note.content) return

    const timer = setTimeout(() => {
      save(title, content, canvasData)
    }, 800)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, loading])

  // Автосохранение холста (с задержкой 800мс)
  useEffect(() => {
    if (loading || !note) return
    if (canvasData === note.canvas_data) return

    const timer = setTimeout(() => {
      save(title, content, canvasData)
    }, 800)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasData, loading])

  // Переключение избранного
  async function toggleFavorite() {
    if (!note) return
    const newValue = !note.is_favorite
    setNote({ ...note, is_favorite: newValue })

    const supabase = createClient()
    await supabase
      .from('notes')
      .update({ is_favorite: newValue })
      .eq('id', note.id)
  }

  // Ctrl+S — сохранить принудительно
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        save(title, content, canvasData)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [title, content, canvasData, save])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <p className="text-gray-500 dark:text-gray-400">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      {/* Верхняя панель */}
      <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-gray-200 dark:border-neutral-800 gap-2">
        {/* Кнопка назад */}
        <button
          onClick={() => router.push('/notes')}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white flex-shrink-0"
          title="Назад"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Переключатель Печать / Рукопись */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode('text')}
            className={`px-3 py-1 rounded-md text-xs transition-colors ${
              mode === 'text'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
            }`}
          >
            Печать
          </button>
          <button
            onClick={() => setMode('canvas')}
            className={`px-3 py-1 rounded-md text-xs transition-colors ${
              mode === 'canvas'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
            }`}
          >
            Рукопись
          </button>
        </div>

        {/* Индикатор сохранения */}
        <div className="flex-1 flex justify-center text-xs text-gray-500 dark:text-gray-400">
          {saving && <span>Сохранение…</span>}
          {!saving && savedAt && (
            <span className="flex items-center gap-1">
              <Check size={12} /> Сохранено
            </span>
          )}
        </div>

        {/* Кнопка избранного */}
        <button
          onClick={toggleFavorite}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 flex-shrink-0"
          title="Избранное"
        >
          <Star
            size={20}
            className={
              note?.is_favorite
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-400 dark:text-gray-500'
            }
          />
        </button>
      </header>

      {/* Название и содержимое */}
      <main className="flex-1 px-4 md:px-8 py-6 w-full mx-auto max-w-2xl md:max-w-4xl lg:max-w-5xl flex flex-col">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название заметки"
          className="w-full text-2xl font-semibold bg-transparent text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none mb-4"
        />

        {mode === 'text' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Начни печатать..."
            className="w-full flex-1 min-h-[60vh] bg-transparent text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none resize-none leading-relaxed"
          />
        ) : (
          <div className="w-full flex-1 min-h-[60vh] rounded-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
            <NoteCanvas
              initialData={canvasData}
              onChange={(json) => setCanvasData(json)}
            />
          </div>
        )}
      </main>
    </div>
  )
}