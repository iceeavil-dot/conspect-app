'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NotesPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <main className="min-h-screen p-6 bg-white dark:bg-black">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-black dark:text-white">
          Мои заметки
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
        >
          Выйти
        </button>
      </div>

      <p className="text-gray-600 dark:text-gray-400">
        Привет, {email ?? '...'}
      </p>

      <p className="text-gray-500 dark:text-gray-500 mt-4 text-sm">
        Здесь будут твои заметки, календарь, планер и трекер привычек.
      </p>
    </main>
  )
}