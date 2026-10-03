'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { CreateHabitModal } from '@/components/habits/create-habit-modal'
import { HabitsGrid } from '@/components/habits/habits-grid'
import { createHabit } from '@/lib/habits'

export default function HabitsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setLoading(false)
    }
    check()
  }, [router])

  async function handleCreateHabit(name: string) {
    const habit = await createHabit(name)
    if (habit) {
      setRefreshKey((k) => k + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Header />
        <div className="p-6 text-gray-500 dark:text-gray-400">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />

      <main className="px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-black dark:text-white">
            Привычки
          </h1>
        </div>

        <HabitsGrid key={refreshKey} />
      </main>

      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
        title="Добавить привычку"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <CreateHabitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateHabit}
      />
    </div>
  )
}