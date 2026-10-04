'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { DayStatsView } from '@/components/productivity/day-stats'
import { WeekChart } from '@/components/productivity/week-chart'
import { MonthChart } from '@/components/productivity/month-chart'
import {
  getDayStats,
  getPreviousDayStats,
  getStreak,
  getWeekStats,
  getMonthStats,
  type DayStats,
  type PeriodStats,
  type MonthStats,
} from '@/lib/productivity'

type Period = 'day' | 'week' | 'month'

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

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

function getMondayOfWeek(date: Date, offset: number): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const jsDay = d.getDay()
  const diff = (jsDay + 6) % 7
  d.setDate(d.getDate() - diff + offset * 7)
  return d
}

const MONTHS_RU_FULL = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

function monthLabelFromOffset(offset: number): string {
  const today = new Date()
  let month = today.getMonth() + offset
  let year = today.getFullYear()
  while (month < 0) {
    month += 12
    year--
  }
  while (month > 11) {
    month -= 12
    year++
  }
  return `${MONTHS_RU_FULL[month]} ${year}`
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

  const [weekStats, setWeekStats] = useState<PeriodStats[]>([])
  const [weekLoading, setWeekLoading] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)

  const [monthStats, setMonthStats] = useState<MonthStats | null>(null)
  const [monthLoading, setMonthLoading] = useState(false)
  const [monthOffset, setMonthOffset] = useState(0)

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

  // День
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

  // Неделя
  useEffect(() => {
    if (loading) return
    if (period !== 'week') return

    async function load() {
      setWeekLoading(true)
      const monday = getMondayOfWeek(new Date(), weekOffset)
      const days = await getWeekStats(formatDate(monday))
      setWeekStats(days)
      setWeekLoading(false)
    }
    load()
  }, [loading, period, weekOffset])

  // Месяц
  useEffect(() => {
    if (loading) return
    if (period !== 'month') return

    async function load() {
      setMonthLoading(true)
      const today = new Date()
      let year = today.getFullYear()
      let month = today.getMonth() + monthOffset
      while (month < 0) {
        month += 12
        year--
      }
      while (month > 11) {
        month -= 12
        year++
      }
      const stats = await getMonthStats(year, month)
      setMonthStats(stats)
      setMonthLoading(false)
    }
    load()
  }, [loading, period, monthOffset])

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
        <h1 className="text-xl font-semibold text-black dark:text-white mb-6">
          Продуктивность
        </h1>

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

        {/* ДЕНЬ */}
        {period === 'day' && (
          <>
            <div className="flex items-center justify-center gap-3 mb-8">
              <button
                onClick={handlePrevDay}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={handleToday}
                className="px-4 py-1 rounded-md text-sm font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 min-w-[110px]"
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

            {statsLoading || !stats ? (
              <div className="text-center text-sm text-gray-400 dark:text-gray-600 py-12">
                Загрузка...
              </div>
            ) : stats.habitsTotal + stats.tasksTotal === 0 ? (
              <div className="text-center text-sm text-gray-400 dark:text-gray-600 py-12">
                Нет данных за этот день. Добавь привычки или задачи.
              </div>
            ) : (
              <DayStatsView stats={stats} prevStats={prevStats} streak={streak} />
            )}
          </>
        )}

        {/* НЕДЕЛЯ */}
        {period === 'week' && (
          <>
            <div className="flex items-center justify-center gap-3 mb-8">
              <button
                onClick={() => setWeekOffset(weekOffset - 1)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() => setWeekOffset(0)}
                className="px-4 py-1 rounded-md text-sm font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 min-w-[110px]"
                title="Текущая неделя"
              >
                {weekOffset === 0
                  ? 'Эта неделя'
                  : weekOffset === -1
                    ? 'Прошлая'
                    : weekOffset === 1
                      ? 'Следующая'
                      : weekOffset < 0
                        ? `${Math.abs(weekOffset)} нед. назад`
                        : `+${weekOffset} нед.`}
              </button>

              <button
                onClick={() => setWeekOffset(weekOffset + 1)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {weekLoading ? (
              <div className="text-center text-sm text-gray-400 dark:text-gray-600 py-12">
                Загрузка...
              </div>
            ) : weekStats.length === 0 ? (
              <div className="text-center text-sm text-gray-400 dark:text-gray-600 py-12">
                Нет данных за эту неделю.
              </div>
            ) : (
              <WeekChart days={weekStats} todayStr={formatDate(new Date())} />
            )}
          </>
        )}

        {/* МЕСЯЦ */}
        {period === 'month' && (
          <>
            <div className="flex items-center justify-center gap-3 mb-8">
              <button
                onClick={() => setMonthOffset(monthOffset - 1)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() => setMonthOffset(0)}
                className="px-4 py-1 rounded-md text-sm font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 min-w-[140px]"
                title="Текущий месяц"
              >
                {monthLabelFromOffset(monthOffset)}
              </button>

              <button
                onClick={() => setMonthOffset(monthOffset + 1)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {monthLoading || !monthStats ? (
              <div className="text-center text-sm text-gray-400 dark:text-gray-600 py-12">
                Загрузка...
              </div>
            ) : (
              <MonthChart
                current={monthStats.current}
                previous={monthStats.previous}
                monthLabel={monthLabelFromOffset(monthOffset)}
                prevMonthLabel={monthLabelFromOffset(monthOffset - 1)}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}