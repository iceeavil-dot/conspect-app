'use client'

import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal, Pencil, Copy, Trash2, Download } from 'lucide-react'

type NoteCardMenuProps = {
  onRename: () => void
  onDuplicate: () => void
  onDelete: () => void
  onExport?: () => void
}

export function NoteCardMenu({
  onRename,
  onDuplicate,
  onDelete,
  onExport,
}: NoteCardMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Закрытие по клику вне меню
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Закрытие по Esc
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 dark:text-gray-500"
        title="Меню"
      >
        <MoreHorizontal size={14} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-20 w-44 py-1 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setOpen(false)
              onRename()
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <Pencil size={14} />
            Переименовать
          </button>

          <button
            onClick={() => {
              setOpen(false)
              onDuplicate()
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <Copy size={14} />
            Дублировать
          </button>

          {onExport && (
            <button
              onClick={() => {
                setOpen(false)
                onExport()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <Download size={14} />
              Экспорт PDF
            </button>
          )}

          <div className="my-1 border-t border-gray-200 dark:border-neutral-800" />

          <button
            onClick={() => {
              setOpen(false)
              onDelete()
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 size={14} />
            Удалить
          </button>
        </div>
      )}
    </div>
  )
}