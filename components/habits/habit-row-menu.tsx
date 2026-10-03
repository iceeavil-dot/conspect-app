'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

type HabitRowMenuProps = {
  onRename: () => void
  onDelete: () => void
}

export function HabitRowMenu({ onRename, onDelete }: HabitRowMenuProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  function handleOpen() {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    setCoords({
      x: rect.left,
      y: rect.bottom + 4,
    })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation()
          if (open) {
            setOpen(false)
          } else {
            handleOpen()
          }
        }}
        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Меню"
      >
        <MoreHorizontal size={14} />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[100] w-40 py-1 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
            style={{ left: coords.x, top: coords.y }}
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
                onDelete()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 size={14} />
              Удалить
            </button>
          </div>,
          document.body
        )}
    </>
  )
}