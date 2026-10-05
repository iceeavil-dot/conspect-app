'use client'

import { useEffect, useRef, useState } from 'react'
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Image as ImageIcon,
  X,
  Loader2,
} from 'lucide-react'
import { uploadFile, deleteFileByUrl } from '@/lib/storage'
import { updateNoteCover } from '@/lib/notes'

type NoteCardMenuProps = {
  noteId: string
  currentCoverUrl: string | null
  onRename: () => void
  onDuplicate: () => void
  onDelete: () => void
  onExport?: () => void
  onCoverChange: (newUrl: string | null) => void
}

export function NoteCardMenu({
  noteId,
  currentCoverUrl,
  onRename,
  onDuplicate,
  onDelete,
  onExport,
  onCoverChange,
}: NoteCardMenuProps) {
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Закрытие по клику вне
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

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    // Удаляем старую обложку (если есть)
    if (currentCoverUrl) {
      await deleteFileByUrl('covers', currentCoverUrl)
    }

    // Загружаем новую
    const url = await uploadFile('covers', file)
    if (url) {
      await updateNoteCover(noteId, url)
      onCoverChange(url)
    }

    setUploading(false)
    setOpen(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleRemoveCover() {
    if (!currentCoverUrl) return

    const confirmed = window.confirm('Убрать обложку?')
    if (!confirmed) return

    setUploading(true)

    // Удаляем файл
    await deleteFileByUrl('covers', currentCoverUrl)

    // Обновляем в базе
    await updateNoteCover(noteId, null)
    onCoverChange(null)

    setUploading(false)
    setOpen(false)
  }

  return (
    <div
  className="relative"
  ref={menuRef}
  onClick={(e) => e.stopPropagation()}
>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-400 dark:text-gray-500"
        title="Меню"
      >
        {uploading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <MoreHorizontal size={14} />
        )}
      </button>

      {/* Скрытый input для обложки */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverUpload}
      />

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-20 w-48 py-1 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
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

          {/* Обложка */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-50"
          >
            <ImageIcon size={14} />
            {currentCoverUrl ? 'Заменить обложку' : 'Загрузить обложку'}
          </button>

          {currentCoverUrl && (
            <button
              onClick={handleRemoveCover}
              disabled={uploading}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-50"
            >
              <X size={14} />
              Убрать обложку
            </button>
          )}

          {onExport && (
            <button
              onClick={() => {
                setOpen(false)
                onExport()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <span className="text-xs">📥</span>
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