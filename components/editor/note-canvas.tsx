'use client'

import { Tldraw, Editor, getSnapshot, loadSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import { useEffect, useRef, forwardRef } from 'react'
import { NotePage } from '@/lib/notes/types'

type TemplateType = 'blank' | 'grid' | 'lines' | 'dots' | 'custom'

type NoteCanvasProps = {
  page: NotePage
  onChange?: (snapshot: any) => void
  template?: TemplateType
  templateUrl?: string | null
}

export function NoteCanvas({
  page,
  onChange,
  template = 'blank',
  templateUrl = null,
}: NoteCanvasProps) {
  const editorRef = useRef<Editor | null>(null)
  const currentPageIdRef = useRef<string>(page.id)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  // ─── Синхронизация фона с камерой tldraw ───
  function syncBackground() {
    if (!editorRef.current || !backgroundRef.current) return

    const camera = editorRef.current.getCamera()
    // camera = { x, y, z } — смещение и зум
    backgroundRef.current.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})`

    // Планируем следующий кадр
    rafRef.current = requestAnimationFrame(syncBackground)
  }

  function handleMount(editor: Editor) {
    editorRef.current = editor

    // Загружаем snapshot
    loadPageSnapshot(editor, page.snapshot)

    // Запускаем синхронизацию фона с камерой
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(syncBackground)

    // Слушаем изменения (для сохранения snapshot)
    let isReady = false
    setTimeout(() => {
      isReady = true
    }, 500)

    editor.store.listen(
      () => {
        if (!onChange) return
        if (!isReady) return
        const snapshot = getSnapshot(editor.store)
        onChange(snapshot)
      },
      { source: 'user', scope: 'document' }
    )
  }

  // При смене страницы — загружаем другой snapshot
  useEffect(() => {
    if (!editorRef.current) return
    if (currentPageIdRef.current === page.id) return
    currentPageIdRef.current = page.id
    loadPageSnapshot(editorRef.current, page.snapshot)
  }, [page.id, page.snapshot])

  // При размонтировании — очищаем RAF
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      className="tldraw-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 56px - 100px)',
        overflow: 'hidden',
      }}
    >
      {/* Фон с шаблоном — синхронизируется с камерой tldraw */}
      <TemplateBackground
        ref={backgroundRef}
        template={template}
        templateUrl={templateUrl}
      />

      {/* Холст tldraw — прозрачный фон */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          background: 'transparent',
        }}
      >
        <Tldraw
  onMount={handleMount}
  licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
/>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Фоновый слой с шаблоном — размер 10000×10000,
// центр фона совпадает с мировой (0, 0) tldraw.
// ─────────────────────────────────────────────────────────────

const BG_SIZE = 10000
const BG_HALF = BG_SIZE / 2

type TemplateBackgroundProps = {
  template: TemplateType
  templateUrl: string | null
}

const TemplateBackground = forwardRef<HTMLDivElement, TemplateBackgroundProps>(
  function TemplateBackground({ template, templateUrl }, ref) {
    if (template === 'blank') {
      return null
    }

    // Свой шаблон — картинка
    if (template === 'custom' && templateUrl) {
      return (
        <div
          ref={ref}
          className="absolute pointer-events-none"
          style={{
            top: `-${BG_HALF}px`,
            left: `-${BG_HALF}px`,
            width: `${BG_SIZE}px`,
            height: `${BG_SIZE}px`,
            backgroundImage: `url(${templateUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        />
      )
    }

    // Паттерны через SVG
    return (
      <div
        ref={ref}
        className="absolute pointer-events-none"
        style={{
          top: `-${BG_HALF}px`,
          left: `-${BG_HALF}px`,
          width: `${BG_SIZE}px`,
          height: `${BG_SIZE}px`,
          transformOrigin: '0 0',
          willChange: 'transform',
        }}
      >
        <svg
          width={BG_SIZE}
          height={BG_SIZE}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {template === 'grid' && (
              <pattern
                id="note-grid"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 24 0 L 0 0 0 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-gray-300 dark:text-neutral-800"
                />
              </pattern>
            )}
            {template === 'lines' && (
              <pattern
                id="note-lines"
                width="100%"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="31.5"
                  x2="100%"
                  y2="31.5"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-gray-300 dark:text-neutral-800"
                />
              </pattern>
            )}
            {template === 'dots' && (
              <pattern
                id="note-dots"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="0.8"
                  fill="currentColor"
                  className="text-gray-400 dark:text-neutral-700"
                />
              </pattern>
            )}
          </defs>
          {template === 'grid' && (
            <rect width="100%" height="100%" fill="url(#note-grid)" />
          )}
          {template === 'lines' && (
            <rect width="100%" height="100%" fill="url(#note-lines)" />
          )}
          {template === 'dots' && (
            <rect width="100%" height="100%" fill="url(#note-dots)" />
          )}
        </svg>
      </div>
    )
  }
)

// ─────────────────────────────────────────────────────────────
// Загрузка snapshot
// ─────────────────────────────────────────────────────────────

function loadPageSnapshot(editor: Editor, snapshot: any) {
  try {
    const allShapeIds = editor.getCurrentPageShapeIds()
    if (allShapeIds.size > 0) {
      editor.deleteShapes(Array.from(allShapeIds))
    }

    if (snapshot) {
      loadSnapshot(editor.store, snapshot)
    }
  } catch (e) {
    console.error('Ошибка загрузки страницы:', e)
  }
}