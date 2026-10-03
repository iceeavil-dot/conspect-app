'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { getHabits, type Habit } from '@/lib/habits'

export default function HabitsPage() {
  const router = useRouter()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const data = await getHabits()
      setHabits(data)
      setLoading(false)
    }
    check()
  }, [router])

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

        {habits.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-500 py-12 text-center">
            Пока нет привычек. Нажми «+», чтобы добавить первую.
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Всего привычек: {habits.length}
            <br />
            <span className="text-xs">
              Сетка будет в следующем шаге
            </span>
          </div>
        )}
      </main>

      <button
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
        title="Добавить привычку"
        onClick={() => alert('Скоро: модалка создания')}
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>
    </div>
  )
}