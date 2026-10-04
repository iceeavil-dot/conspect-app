'use client'

import type { PeriodStats } from '@/lib/productivity'

type WeekChartProps = {
  days: PeriodStats[]
  todayStr: string
}

const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function getWeekdayIndex(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00')
  const jsDay = d.getDay()
  return (jsDay + 6) % 7
}

function getDayNumber(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00')
  return d.getDate()
}

export function WeekChart({ days, todayStr }: WeekChartProps) {
  // Высота графика в пикселях
  const CHART_HEIGHT = 220

  return (
    <div className="w-full">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatRange(days)}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Среднее:
          </span>
          <span className="text-lg font-semibold text-black dark:text-white tabular-nums">
            {average(days)}%
          </span>
        </div>
      </div>

      {/* График */}
      <div className="relative" style={{ height: CHART_HEIGHT + 40 }}>
        {/* Горизонтальные линии */}
        <div
          className="absolute left-0 right-0 top-0 pointer-events-none"
          style={{ height: CHART_HEIGHT }}
        >
          {[100, 75, 50, 25, 0].map((line) => (
            <div
              key={line}
              className="absolute left-0 right-0 flex items-center"
              style={{ top: `${100 - line}%` }}
            >
              <span className="text-[10px] text-gray-400 dark:text-gray-600 w-8 text-right pr-2 tabular-nums">
                {line}%
              </span>
              <div className="flex-1 border-t border-dashed border-gray-200 dark:border-neutral-800" />
            </div>
          ))}
        </div>

        {/* Столбики */}
        <div
          className="absolute left-10 right-0 flex items-end justify-between gap-2"
          style={{ height: CHART_HEIGHT, top: 0 }}
        >
          {days.map((day) => {
            const weekdayIdx = getWeekdayIndex(day.date)
            const dayNum = getDayNumber(day.date)
            const isToday = day.date === todayStr
            const barHeightPx = Math.max((day.percent / 100) * CHART_HEIGHT, 4)

            return (
              <div
                key={day.date}
                className="flex-1 h-full flex flex-col justify-end items-center group"
              >
                {/* % над столбиком (для today — всегда, для остальных — при hover) */}
                <div
                  className={`text-[11px] mb-1 tabular-nums transition-opacity ${
                    isToday
                      ? 'text-black dark:text-white font-semibold opacity-100'
                      : 'text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {day.percent}%
                </div>

                {/* Столбик */}
                <div
                  className={`w-full max-w-[50px] rounded-t-sm transition-all duration-500 ${
                    isToday
                      ? 'bg-black dark:bg-white'
                      : 'bg-gray-400 dark:bg-neutral-600 group-hover:bg-gray-500 dark:group-hover:bg-neutral-500'
                  }`}
                  style={{ height: `${barHeightPx}px` }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Подписи снизу (Пн 28, Вт 29...) */}
      <div className="ml-10 flex justify-between gap-2 mt-2">
        {days.map((day) => {
          const weekdayIdx = getWeekdayIndex(day.date)
          const dayNum = getDayNumber(day.date)
          const isToday = day.date === todayStr

          return (
            <div key={day.date} className="flex-1 text-center">
              <div
                className={`text-xs font-medium ${
                  isToday
                    ? 'text-black dark:text-white'
                    : 'text-gray-500 dark:text-gray-500'
                }`}
              >
                {WEEKDAYS_SHORT[weekdayIdx]}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-600 tabular-nums">
                {dayNum}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function average(days: PeriodStats[]): number {
  if (days.length === 0) return 0
  const sum = days.reduce((acc, d) => acc + d.percent, 0)
  return Math.round(sum / days.length)
}

function formatRange(days: PeriodStats[]): string {
  if (days.length === 0) return ''
  const first = new Date(days[0].date + 'T00:00:00')
  const last = new Date(days[days.length - 1].date + 'T00:00:00')

  const months = [
    'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
  ]

  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()}–${last.getDate()} ${months[first.getMonth()]}`
  }
  return `${first.getDate()} ${months[first.getMonth()]} – ${last.getDate()} ${months[last.getMonth()]}`
} 