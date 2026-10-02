'use client'

import { Tldraw, Editor, getSnapshot, loadSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import { useEffect, useRef } from 'react'
import { NotePage } from '@/lib/notes/types'

type NoteCanvasProps = {
  page: NotePage
  onChange?: (snapshot: any) => void
}

export function NoteCanvas({ page, onChange }: NoteCanvasProps) {
  const editorRef = useRef<Editor | null>(null)
  const currentPageIdRef = useRef<string | null>(null)
  const isFirstMountRef = useRef(true)

  function handleMount(editor: Editor) {
    editorRef.current = editor

    // Загружаем только если это первый mount для этой страницы
    if (isFirstMountRef.current) {
      console.log('=== NoteCanvas: ПЕРВЫЙ mount ===')
      isFirstMountRef.current = false
      currentPageIdRef.current = page.id
      loadPageSnapshot(editor, page.snapshot)
    } else {
      console.log('=== NoteCanvas: ПОВТОРНЫЙ mount (StrictMode), пропускаем загрузку ===')
    }

    editor.store.listen(
      () => {
        if (!onChange) return
        const snapshot = getSnapshot(editor.store)
        onChange(snapshot)
      },
      { source: 'user', scope: 'document' }
    )
  }

  // Переключение страницы
  useEffect(() => {
    if (!editorRef.current) return
    if (currentPageIdRef.current === page.id) return

    console.log('=== СМЕНА СТРАНИЦЫ ===', page.id)
    currentPageIdRef.current = page.id
    loadPageSnapshot(editorRef.current, page.snapshot)
  }, [page.id, page.snapshot])

  return (
    <div
      className="tldraw-wrapper"
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <Tldraw onMount={handleMount} />
    </div>
  )
}

function loadPageSnapshot(editor: Editor, snapshot: any) {
  console.log('=== loadPageSnapshot ===')
  console.log('snapshot:', snapshot ? `есть (${JSON.stringify(snapshot).length} b)` : 'null')

  try {
    const allShapeIds = editor.getCurrentPageShapeIds()
    console.log('фигур на холсте:', allShapeIds.size)

    if (allShapeIds.size > 0) {
      editor.deleteShapes(Array.from(allShapeIds))
      console.log('старые удалены')
    }

    if (snapshot) {
      loadSnapshot(editor.store, snapshot)
      console.log('loadSnapshot завершён')
    }
  } catch (e) {
    console.error('❌ Ошибка:', e)
  }
}