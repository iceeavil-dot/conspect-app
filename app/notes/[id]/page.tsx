'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Star, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NoteCanvas } from '@/components/editor/note-canvas'
import { PageNavigator } from '@/components/editor/page-navigator'
import {
  CanvasData,
  NotePage,
  PageTemplate,
} from '@/lib/notes/types'
import {
  createEmptyPage,
  parseCanvasData,
  serializeCanvasData,
} from '@/lib/notes/pages'

type Note = {
  id: string
  title: string
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
  const [canvasData, setCanvasData] = useState<CanvasData>({
    pages: [createEmptyPage(0)],
    currentPage: 0,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  // Ref, чтобы избежать stale state в автосохранении
  const canvasDataRef = useRef(canvasData)
  canvasDataRef.current = canvasData

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
      setCanvasData(parseCanvasData(data.canvas_data))
      setLoading(false)
    }
    load()
  }, [noteId, router])

  // Сохранение
  const save = useCallback(
    async (newTitle: string, newCanvasData: CanvasData) => {
      if (!noteId) return
      setSaving(true)
      const supabase = createClient()
      const { error } = await supabase
        .from('notes')
        .update({
          title: newTitle,
          canvas_data: serializeCanvasData(newCanvasData),
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

  // Автосохранение при изменении title или canvasData
  useEffect(() => {
    if (loading || !note) return
    const timer = setTimeout(() => {
      save(title, canvasData)
    }, 800)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, canvasData])

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

  // Обновление snapshot текущей страницы
  function handleCanvasChange(snapshot: any) {
    setCanvasData((prev) => {
      const pages = [...prev.pages]
      pages[prev.currentPage] = {
        ...pages[prev.currentPage],
        snapshot,
      }
      return { ...prev, pages }
    })
  }

  // Переключение на предыдущую страницу
  function handlePrevPage() {
    setCanvasData((prev) => ({
      ...prev,
      currentPage: Math.max(0, prev.currentPage - 1),
    }))
  }

  // Переключение на следующую страницу
  function handleNextPage() {
    setCanvasData((prev) => ({
      ...prev,
      currentPage: Math.min(prev.pages.length - 1, prev.currentPage + 1),
    }))
  }

  // Добавление новой страницы
  function handleAddPage(template: PageTemplate = 'blank') {
    setCanvasData((prev) => {
      const newIndex = prev.pages.length
      const newPage = createEmptyPage(newIndex, template)
      return {
        pages: [...prev.pages, newPage],
        currentPage: newIndex,
      }
    })
  }

  // Ctrl+S
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        save(title, canvasDataRef.current)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [title, save])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <p className="text-gray-500 dark:text-gray-400">Загрузка...</p>
      </div>
    )
  }

  const currentPage: NotePage = canvasData.pages[canvasData.currentPage]

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      {/* Верхняя панель */}
      <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-gray-200 dark:border-neutral-800 gap-2">
        <button
          onClick={() => router.push('/notes')}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white flex-shrink-0"
          title="Назад"
        >
          <ArrowLeft size={20} />
        </button>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название заметки"
          className="flex-1 max-w-md mx-auto text-center text-base font-medium bg-transparent text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none"
        />

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-xs text-gray-500 dark:text-gray-400 min-w-[80px] text-right">
            {saving && <span>Сохранение…</span>}
            {!saving && savedAt && (
              <span className="inline-flex items-center gap-1">
                <Check size={12} /> Сохранено
              </span>
            )}
          </div>

          <button
            onClick={toggleFavorite}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
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
        </div>
      </header>

      {/* Область холста */}
      <main className="flex-1 overflow-hidden">
        <NoteCanvas page={currentPage} onChange={handleCanvasChange} />
      </main>

      {/* Панель страниц */}
      <PageNavigator
        data={canvasData}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onAddPage={() => handleAddPage('blank')}
      />
    </div>
  )
}