'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const tabs = [
  { label: 'Заметки', href: '/notes' },
  { label: 'Планер', href: '/planner' },
  { label: 'Привычки', href: '/habits' },
  { label: 'Календарь', href: '/calendar' },
  { label: 'Продуктивность', href: '/productivity' },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && theme === 'dark'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="w-full border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-black">
      <div className="flex items-center justify-between gap-4 px-4 md:px-6 h-14">
        {/* Левая часть: переключатель темы */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-900 text-black dark:text-white"
            title="Переключить тему"
          >
            {mounted ? (
              isDark ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )
            ) : (
              <Moon size={20} />
            )}
          </button>
        </div>

        {/* Центр: вкладки */}
        <nav className="flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-800 px-1 py-1">
          {tabs.map((tab) => {
            const active =
              pathname === tab.href || pathname.startsWith(tab.href + '/')
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={
                  'px-4 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap ' +
                  (active
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900')
                }
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>

        {/* Правая часть: выход */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-900 text-black dark:text-white"
            title="Выйти"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}