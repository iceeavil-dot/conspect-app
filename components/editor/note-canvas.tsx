'use client'

import { Tldraw, Editor, getSnapshot, loadSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import { useRef } from 'react'

type NoteCanvasProps = {
  initialData?: string | null
  onChange?: (json: string) => void
}

export function NoteCanvas({ initialData, onChange }: NoteCanvasProps) {
  const initialDataRef = useRef(initialData)

  function handleMount(editor: Editor) {
    // Загружаем сохранённые данные СРАЗУ после монтирования
    if (initialDataRef.current) {
      try {
        const snapshot = JSON.parse(initialDataRef.current)
        loadSnapshot(editor.store, snapshot)
      } catch (e) {
        console.error('Ошибка загрузки холста:', e)
      }
    }

    // Слушаем изменения — сохраняем в родителя
    editor.store.listen(
      () => {
        if (!onChange) return
        const snapshot = getSnapshot(editor.store)
        onChange(JSON.stringify(snapshot))
      },
      { source: 'user', scope: 'document' }
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
      <Tldraw onMount={handleMount} />
    </div>
  )
}