'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NoteCanvas } from '@/components/editor/note-canvas'
import { PageNavigator } from '@/components/editor/page-navigator'
import { parseCanvasData, serializeCanvasData, createEmptyPage } from '@/lib/notes/pages'
import { CanvasData, NotePage, PageTemplate } from '@/lib/notes/types'

export default function NoteEditorPage() {
  const router = useRouter()
  const params = useParams()
  const noteId = params.id as string

  const lastSnapshotRef = useRef<string>('')

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [canvasData, setCanvasData] = useState<CanvasData>({
    pages: [createEmptyPage(0)],
    currentPage: 0,
  })

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

      setTitle(data.title)
      setCanvasData(parseCanvasData(data.canvas_data))
      setLoading(false)
    }
    load()
  }, [noteId, router])

  const save = useCallback(
    async (data: CanvasData) => {
      if (!noteId) return
      const supabase = createClient()
      await supabase
        .from('notes')
        .update({
          canvas_data: serializeCanvasData(data),
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId)
    },
    [noteId]
  )

  function handleCanvasChange(snapshot: any) {
    const serialized = JSON.stringify(snapshot)
    if (serialized === lastSnapshotRef.current) return
    lastSnapshotRef.current = serialized

    setCanvasData((prev) => {
      const pages = [...prev.pages]
      pages[prev.currentPage] = {
        ...pages[prev.currentPage],
        snapshot,
      }
      return { ...prev, pages }
    })
  }

  // Автосохранение
  useEffect(() => {
    if (loading) return
    const timer = setTimeout(() => {
      save(canvasData)
    }, 1500)
    return () => clearTimeout(timer)
  }, [canvasData, loading, save])

  // Переключение страниц
  function handlePrevPage() {
    lastSnapshotRef.current = ''  // сброс защиты — другая страница
    setCanvasData((prev) => ({
      ...prev,
      currentPage: Math.max(0, prev.currentPage - 1),
    }))
  }

  function handleNextPage() {
    lastSnapshotRef.current = ''
    setCanvasData((prev) => ({
      ...prev,
      currentPage: Math.min(prev.pages.length - 1, prev.currentPage + 1),
    }))
  }

  function handleAddPage(template: PageTemplate = 'blank') {
    lastSnapshotRef.current = ''
    setCanvasData((prev) => {
      const newIndex = prev.pages.length
      const newPage = createEmptyPage(newIndex, template)
      return {
        pages: [...prev.pages, newPage],
        currentPage: newIndex,
      }
    })
  }

  if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>

  const currentPage: NotePage | undefined = canvasData.pages[canvasData.currentPage]

if (!currentPage) {
  console.log('=== currentPage undefined ===')
  console.log('pages.length:', canvasData.pages.length)
  console.log('currentPage index:', canvasData.currentPage)
  console.log('full canvasData:', JSON.stringify(canvasData).substring(0, 500))
  return <div style={{ padding: 20 }}>Ошибка загрузки страницы</div>
}
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      <header className="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-neutral-800">
        <button
          onClick={() => router.push('/notes')}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-sm font-medium">{title}</span>
        <div style={{ width: 40 }} />
      </header>

      <main className="overflow-hidden" style={{ height: 'calc(100vh - 56px - 100px)' }}>
      <NoteCanvas
  key={currentPage.id}
  page={currentPage}
  onChange={handleCanvasChange}
/>
</main>

      <PageNavigator
        data={canvasData}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onAddPage={() => handleAddPage('blank')}
      />
    </div>
  )
}