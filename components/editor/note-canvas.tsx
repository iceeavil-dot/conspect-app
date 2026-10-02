'use client'

import { Tldraw, Editor, getSnapshot, loadSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import { NotePage } from '@/lib/notes/types'

type NoteCanvasProps = {
  page: NotePage
  onChange?: (snapshot: any) => void
}

export function NoteCanvas({ page, onChange }: NoteCanvasProps) {
  console.log('=== NoteCanvas рендерится ===', page.id, 'snapshot:', page.snapshot ? 'есть' : 'null')

  function handleMount(editor: Editor) {
  console.log('=== handleMount ===')

  // Загружаем сохранённый snapshot, если он есть
  if (page.snapshot) {
    try {
      console.log('=== Пробую loadSnapshot ===')
      loadSnapshot(editor.store, page.snapshot)
      console.log('=== loadSnapshot OK ===')
    } catch (e) {
      console.error('=== loadSnapshot FAIL ===', e)
    }
  }

  // Слушаем изменения — НО с защитой от первой волны событий
  let isReady = false
  setTimeout(() => {
    isReady = true
  }, 500)  // ← ждём 500мс, пока tldraw прогрузится

  editor.store.listen(
    () => {
      if (!onChange) return
      if (!isReady) return  // ← не отправляем при инициализации
      const snapshot = getSnapshot(editor.store)
      onChange(snapshot)
    },
    { source: 'user', scope: 'document' }
  )
}

    return (
    <div
      className="tldraw-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 56px)',
      }}
    >
      <Tldraw onMount={handleMount} />
    </div>
  )
}