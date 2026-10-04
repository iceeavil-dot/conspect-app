'use client'

import type { DayStats } from '@/lib/productivity'

type DayStatsProps = {
  stats: DayStats
  prevStats: DayStats | null
  streak: number
}

export function DayStatsView({ stats, prevStats, streak }: DayStatsProps) {
  // Сравнение с вчера
  const diff = prevStats ? stats.totalPercent - prevStats.totalPercent : 0
  const isUp = diff > 0
  const isDown = diff < 0
  const isEqual = diff === 0 && prevStats !== null

  return (
    <>
      {/* ─── Верхний ряд: Streak + Сравнение ─── */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        {/* Streak */}
        <div>
          {streak > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="text-base font-medium text-black dark:text-white">
                  {streak} {declOfNum(streak, ['день', 'дня', 'дней'])} подряд
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  (серия больше 80%)
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400 dark:text-gray-600">
              Серия пока не начата (нужно 80%+)
            </div>
          )}
        </div>

        {/* Сравнение с вчера */}
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-sm text-gray-500 dark:text-gray-500">
              Сегодня:
            </span>
            <span className="text-lg font-semibold text-black dark:text-white tabular-nums">
              {stats.totalPercent}%
            </span>
            {prevStats && (
              <span
                className={`text-sm font-medium tabular-nums ${
                  isUp
                    ? 'text-green-600 dark:text-green-500'
                    : isDown
                      ? 'text-red-600 dark:text-red-500'
                      : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {isUp && `▲ +${diff}%`}
                {isDown && `▼ ${diff}%`}
                {isEqual && `0%`}
              </span>
            )}
          </div>
          {prevStats && (
            <div className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">
              Вчера: {prevStats.totalPercent}%
            </div>
          )}
        </div>
      </div>

      {/* ─── Основной блок: Donut + Разбивка ─── */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
        {/* Donut — слева */}
        <div className="shrink-0">
          <DonutInline
            percent={stats.totalPercent}
            habitShare={stats.habitShare}
            taskShare={stats.taskShare}
          />
        </div>

        {/* Разбивка — справа */}
        <div className="flex-1 w-full flex flex-col gap-6 pt-2">
          {/* Привычки */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Привычки ({stats.habitsDone}/{stats.habitsTotal})
              </span>
              <span className="text-sm font-medium text-black dark:text-white tabular-nums">
                {stats.habitsPercent}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-neutral-900 overflow-hidden">
              <div
                className="h-full bg-gray-300 dark:bg-neutral-600 transition-all duration-300"
                style={{ width: `${stats.habitsPercent}%` }}
              />
            </div>
          </div>

          {/* To-do */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                To-do ({stats.tasksDone}/{stats.tasksTotal})
              </span>
              <span className="text-sm font-medium text-black dark:text-white tabular-nums">
                {stats.tasksPercent}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-neutral-900 overflow-hidden">
              <div
                className="h-full bg-gray-700 dark:bg-gray-300 transition-all duration-300"
                style={{ width: `${stats.tasksPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Списки ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {/* Выполнено */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Выполнено ({stats.doneItems.length})
          </h3>
          {stats.doneItems.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-600">
              Пока ничего
            </p>
          ) : (
            <ul className="space-y-1.5">
              {stats.doneItems.map((item, i) => (
                <li
                  key={i}
                  className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                >
                  <span className="text-gray-400 dark:text-gray-600 select-none">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Не выполнено */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Не выполнено ({stats.notDoneItems.length})
          </h3>
          {stats.notDoneItems.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-600">
              Всё выполнено 🎉
            </p>
          ) : (
            <ul className="space-y-1.5">
              {stats.notDoneItems.map((item, i) => (
                <li
                  key={i}
                  className="text-sm text-gray-500 dark:text-gray-500 flex items-start gap-2"
                >
                  <span className="text-gray-400 dark:text-gray-600 select-none">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// Импорт Donut внутри файла (чтобы не плодить зависимости)
// ─────────────────────────────────────────────────────────────

import { DonutChart as DonutInline } from './donut-chart'

// ─────────────────────────────────────────────────────────────
// Утилита: склонение слова "день" по числу
// ─────────────────────────────────────────────────────────────

function declOfNum(n: number, titles: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2]
  return titles[
    n % 100 > 4 && n % 100 < 20 ? 2 : cases[Math.min(n % 10, 5)]
  ]
}