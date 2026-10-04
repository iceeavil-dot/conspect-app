'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { DonutChart } from '@/components/productivity/donut-chart'
import {
  getDayStats,
  getPreviousDayStats,
  getStreak,
  type DayStats,
} from '@/lib/productivity'

type Period = 'day' | 'week' | 'month'

// Формат даты → YYYY-MM-DD
function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Красивое название даты
function formatHumanDate(d: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)

  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Завтра'
  if (diffDays === -1) return 'Вчера'

  const months = [
    'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export default function ProductivityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('day')
  const [date, setDate] = useState(new Date())

  const [stats, setStats] = useState<DayStats | null>(null)
  const [prevStats, setPrevStats] = useState<DayStats | null>(null)
  const [streak, setStreak] = useState(0)
  const [statsLoading, setStatsLoading] = useState(false)

  // Проверка авторизации
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

  // Загрузка статистики при смене даты (только для Дня)
  useEffect(() => {
    if (loading) return
    if (period !== 'day') return

    async function load() {
      setStatsLoading(true)
      const dateStr = formatDate(date)
      const [today, yesterday, streakValue] = await Promise.all([
        getDayStats(dateStr),
        getPreviousDayStats(dateStr),
        getStreak(dateStr, 80),
      ])
      setStats(today)
      setPrevStats(yesterday)
      setStreak(streakValue)
      setStatsLoading(false)
    }
    load()
  }, [date, loading, period])

  function handlePrevDay() {
    const d = new Date(date)
    d.setDate(d.getDate() - 1)
    setDate(d)
  }

  function handleNextDay() {
    const d = new Date(date)
    d.setDate(d.getDate() + 1)
    setDate(d)
  }

  function handleToday() {
    setDate(new Date())
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

      <main className="px-4 md:px-6 py-6 max-w-5xl mx-auto">
        {/* Заголовок */}
        <h1 className="text-xl font-semibold text-black dark:text-white mb-6">
          Продуктивность
        </h1>

        {/* Переключатель периода */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex border border-gray-200 dark:border-neutral-800 rounded-full p-1">
            <button
              onClick={() => setPeriod('day')}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                period === 'day'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-900'
              }`}
            >
              День
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                period === 'week'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-900'
              }`}
            >
              Неделя
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                period === 'month'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-900'
              }`}
            >
              Месяц
            </button>
          </div>
        </div>

        {/* Навигация по датам — только для Дня */}
        {period === 'day' && (
          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={handleToday}
              className="px-4 py-1 rounded-md text-sm font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 min-w-[110px]"
              title="Перейти к сегодня"
            >
              {formatHumanDate(date)}
            </button>

            <button
              onClick={handleNextDay}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ─── ДЕНЬ ─── */}
        {period === 'day' && (
          <>
            {statsLoading || !stats ? (
              <div className="text-center text-sm text-gray-400 dark:text-gray-600 py-12">
                Загрузка...
              </div>
            ) : stats.habitsTotal + stats.tasksTotal === 0 ? (
              <div className="text-center text-sm text-gray-400 dark:text-gray-600 py-12">
                Нет данных за этот день. Добавь привычки или задачи.
              </div>
            ) : (
              <div className="flex justify-center">
                <DonutChart
                  percent={stats.totalPercent}
                  habitShare={stats.habitShare}
                  taskShare={stats.taskShare}
                />
              </div>
            )}
          </>
        )}

        {/* ─── НЕДЕЛЯ ─── */}
        {period === 'week' && (
          <div className="border border-dashed border-gray-300 dark:border-neutral-800 rounded-lg p-12 text-center text-gray-400 dark:text-gray-600">
            График за неделю — следующая часть
          </div>
        )}

        {/* ─── МЕСЯЦ ─── */}
        {period === 'month' && (
          <div className="border border-dashed border-gray-300 dark:border-neutral-800 rounded-lg p-12 text-center text-gray-400 dark:text-gray-600">
            График за месяц — следующая часть
          </div>
        )}
      </main>
    </div>
  )
}