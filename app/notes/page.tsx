'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { NotesGrid } from '@/components/notes/notes-grid'
import { CreateNoteModal } from '@/components/notes/create-note-modal'
import { createNote } from '@/lib/notes'

export default function NotesPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('...')
  const [modalOpen, setModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
        return
      }
      setDisplayName(data.user.email?.split('@')[0] ?? 'гость')
    })
  }, [router])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handleCreateNote(title: string) {
    const note = await createNote(title)
    if (note) {
      // Заставляем сетку перезагрузиться
      setRefreshKey((k) => k + 1)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />

      <main className="px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-black dark:text-white">
            Привет, {displayName}
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
          >
            Выйти
          </button>
        </div>

        <NotesGrid key={refreshKey} />
      </main>

      {/* Круглая кнопка "+" */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
        title="Создать заметку"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Модалка создания */}
      <CreateNoteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateNote}
      />
    </div>
  )
}