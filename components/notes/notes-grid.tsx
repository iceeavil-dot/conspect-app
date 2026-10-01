'use client'

import { useEffect, useState } from 'react'
import { NoteCard } from './note-card'
import { getNotes, toggleFavorite, type Note } from '@/lib/notes'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

export function NotesGrid() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotes()
  }, [])

  async function loadNotes() {
    setLoading(true)
    const data = await getNotes()
    setNotes(data)
    setLoading(false)
  }

  async function handleToggleFavorite(id: string) {
    const note = notes.find((n) => n.id === id)
    if (!note) return

    const newValue = !note.is_favorite

    // Оптимистичное обновление — сразу меняем UI, потом синхронизация с базой
    setNotes((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, is_favorite: newValue } : n
      )
      return sortNotes(updated)
    })

    // Отправляем в Supabase
    const ok = await toggleFavorite(id, newValue)
    if (!ok) {
      // Если ошибка — откатываем назад
      loadNotes()
    }
  }

  function sortNotes(list: Note[]): Note[] {
    return [...list].sort((a, b) => {
      if (a.is_favorite && !b.is_favorite) return -1
      if (!a.is_favorite && b.is_favorite) return 1
      return 0
    })
  }

  if (loading) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-500 py-8">
        Загрузка заметок...
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-500 py-8">
        Пока нет заметок. Нажми «+», чтобы создать первую.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          title={note.title}
          date={formatDate(note.created_at)}
          coverUrl={note.cover_url}
          isFavorite={note.is_favorite}
          onToggleFavorite={() => handleToggleFavorite(note.id)}
        />
      ))}
    </div>
  )
}