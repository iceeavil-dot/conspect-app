'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NoteCanvas } from '@/components/editor/note-canvas'
import { parseCanvasData, createEmptyPage } from '@/lib/notes/pages'
import { CanvasData, NotePage } from '@/lib/notes/types'

export default function NoteEditorPage() {
  const router = useRouter()
  const params = useParams()
  const noteId = params.id as string

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

  if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>

  const currentPage: NotePage = canvasData.pages[canvasData.currentPage]

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

      <main className="flex-1 overflow-hidden">
        <NoteCanvas page={currentPage} />
      </main>
    </div>
  )
}