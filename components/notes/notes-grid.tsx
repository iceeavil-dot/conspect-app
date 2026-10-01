'use client'

import { NoteCard } from './note-card'

type Note = {
  id: string
  title: string
  date: string
  coverUrl?: string | null
  isFavorite?: boolean
}

const MOCK_NOTES: Note[] = [
  { id: '1', title: 'Краткое руководство', date: '09.10.2025', isFavorite: true },
  { id: '2', title: 'Новая Заметка', date: '30.09.2025' },
  { id: '3', title: 'Новая Заметка', date: '30.09.2025' },
  { id: '4', title: 'Новая Заметка', date: '30.09.2025' },
  { id: '5', title: 'Новая Заметка', date: '30.09.2025' },
  { id: '6', title: 'Новая Заметка', date: '30.09.2025' },
  { id: '7', title: 'Новая Заметка', date: '30.09.2025' },
  { id: '8', title: 'Новая Заметка', date: '30.09.2025' },
  { id: '9', title: 'Успокаивающие растения', date: '09.10.2025' },
  { id: '10', title: 'U', date: '30.09.2025' },
]

export function NotesGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
      {MOCK_NOTES.map((note) => (
        <NoteCard
          key={note.id}
          title={note.title}
          date={note.date}
          coverUrl={note.coverUrl}
          isFavorite={note.isFavorite}
        />
      ))}
    </div>
  )
}