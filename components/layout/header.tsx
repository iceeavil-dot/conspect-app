'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Settings, Moon, Sun, Search, User } from 'lucide-react'

const tabs = [
  { label: 'Заметки', href: '/notes' },
  { label: 'Планер', href: '/planner' },
  { label: 'Привычки', href: '/habits' },
  { label: 'Календарь', href: '/calendar' },
  { label: 'Продуктивность', href: '/productivity' },
]

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Чтобы не было ошибки гидратации при SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && theme === 'dark'

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <div className="flex items-center justify-between gap-4 px-4 md:px-6 h-14">
        {/* Левая часть: настройки + тема */}
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 text-black dark:text-white"
            title="Настройки"
          >
            <Settings size={20} />
          </Link>

          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 text-black dark:text-white"
            title="Переключить тему"
          >
            {mounted ? (isDark ? <Sun size={20} /> : <Moon size={20} />) : <Moon size={20} />}
          </button>
        </div>

        {/* Центр: вкладки */}
        <nav className="flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-800 px-1 py-1">
          {tabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
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

        {/* Правая часть: поиск + профиль */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 text-black dark:text-white"
            title="Поиск"
          >
            <Search size={20} />
          </button>
          <Link
            href="/profile"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 text-black dark:text-white"
            title="Профиль"
          >
            <User size={20} />
          </Link>
        </div>
      </div>
    </header>
  )
}