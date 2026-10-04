'use client'

import { useState } from 'react'
import type { PeriodStats } from '@/lib/productivity'

type MonthChartProps = {
  current: PeriodStats[]
  previous: PeriodStats[]
  monthLabel: string
  prevMonthLabel: string
}

const CHART_HEIGHT = 280
const PADDING_LEFT = 44
const PADDING_RIGHT = 16
const PADDING_TOP = 16
const PADDING_BOTTOM = 40

export function MonthChart({
  current,
  previous,
  monthLabel,
  prevMonthLabel,
}: MonthChartProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

  if (current.length === 0) {
    return (
      <div className="text-center text-sm text-gray-400 dark:text-gray-600 py-12">
        Нет данных за этот месяц.
      </div>
    )
  }

  // Средние (игнорируем -1)
  const currentAvg = average(current)
  const prevAvg = average(previous)

  // Размеры
  const chartWidth = 900
  const innerWidth = chartWidth - PADDING_LEFT - PADDING_RIGHT
  const innerHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM

  const totalDays = current.length

  function xFor(dayIndex: number): number {
    if (totalDays === 1) return PADDING_LEFT + innerWidth / 2
    return PADDING_LEFT + (dayIndex / (totalDays - 1)) * innerWidth
  }

  function yFor(percent: number): number {
    return PADDING_TOP + innerHeight - (percent / 100) * innerHeight
  }

  // Строим путь линии: пропускаем будущие дни (percent === -1)
  function buildPath(points: PeriodStats[]): string {
    const segments: string[] = []
    let started = false

    points.forEach((p, i) => {
      if (p.percent < 0) {
        // Будущий день — обрываем линию
        started = false
        return
      }
      const x = xFor(i)
      const y = yFor(p.percent)
      if (!started) {
        segments.push(`M ${x} ${y}`)
        started = true
      } else {
        segments.push(`L ${x} ${y}`)
      }
    })

    return segments.join(' ')
  }

  const currentPath = buildPath(current)
  const prevPath = buildPath(previous)

  // Горизонтальные линии — каждые 10%
  const yLines = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

  return (
    <div className="w-full">
      {/* Легенда + средние */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-0.5 bg-black dark:bg-white" />
            <span className="text-gray-700 dark:text-gray-300">
              {monthLabel}
            </span>
            <span className="font-semibold text-black dark:text-white tabular-nums">
              {currentAvg}%
            </span>
          </div>
          {previous.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-0.5 bg-gray-400 dark:bg-neutral-600" />
              <span className="text-gray-500 dark:text-gray-400">
                {prevMonthLabel}
              </span>
              <span className="text-gray-500 dark:text-gray-400 tabular-nums">
                {prevAvg}%
              </span>
            </div>
          )}
        </div>

        {previous.length > 0 && (
          <div className="text-sm">
            {currentAvg > prevAvg && (
              <span className="text-green-600 dark:text-green-500">
                ▲ +{currentAvg - prevAvg}% к прошлому
              </span>
            )}
            {currentAvg < prevAvg && (
              <span className="text-red-600 dark:text-red-500">
                ▼ {currentAvg - prevAvg}% к прошлому
              </span>
            )}
            {currentAvg === prevAvg && (
              <span className="text-gray-400 dark:text-gray-600">
                = как в прошлом
              </span>
            )}
          </div>
        )}
      </div>

      {/* График */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
          className="w-full"
          style={{ minWidth: 700, height: 'auto' }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Горизонтальные линии */}
          {yLines.map((line) => {
            const y = yFor(line)
            const isMajor = line % 20 === 0
            return (
              <g key={line}>
                <line
                  x1={PADDING_LEFT}
                  y1={y}
                  x2={chartWidth - PADDING_RIGHT}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth={isMajor ? 0.6 : 0.3}
                  strokeDasharray={isMajor ? '2 4' : '1 6'}
                  className={
                    isMajor
                      ? 'text-gray-300 dark:text-neutral-800'
                      : 'text-gray-200 dark:text-neutral-900'
                  }
                />
                <text
                  x={PADDING_LEFT - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={isMajor ? 10 : 8}
                  className={
                    isMajor
                      ? 'fill-gray-500 dark:fill-gray-500 tabular-nums'
                      : 'fill-gray-400 dark:fill-gray-700 tabular-nums'
                  }
                >
                  {line}
                </text>
              </g>
            )
          })}

          {/* Линия прошлого месяца */}
          {previous.length > 0 && (
            <path
              d={prevPath}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-gray-300 dark:text-neutral-700"
            />
          )}

          {/* Линия текущего месяца */}
          <path
            d={currentPath}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-black dark:text-white"
          />

          {/* Точки текущего месяца (только реальные дни) */}
          {current.map((p, i) => {
            if (p.percent < 0) return null
            return (
              <circle
                key={p.date}
                cx={xFor(i)}
                cy={yFor(p.percent)}
                r={hoveredDay === i ? 5 : 3}
                className="fill-black dark:fill-white transition-all"
                onMouseEnter={() => setHoveredDay(i)}
                onMouseLeave={() => setHoveredDay(null)}
                style={{ cursor: 'pointer' }}
              />
            )
          })}

          {/* Точки прошлого месяца */}
          {previous.map((p, i) => {
            if (p.percent < 0) return null
            return (
              <circle
                key={`prev-${p.date}`}
                cx={xFor(i)}
                cy={yFor(p.percent)}
                r={2}
                className="fill-gray-400 dark:fill-neutral-600"
              />
            )
          })}

          {/* Подписи X — горизонтальные, не все числа */}
          {current.map((p, i) => {
            const dayNum = i + 1
            // Показываем 1, потом каждое 5-е, и последнее
            const showEvery = totalDays > 20 ? 5 : 2
            const shouldShow =
              dayNum === 1 ||
              dayNum % showEvery === 0 ||
              dayNum === totalDays

            if (!shouldShow) return null

            return (
              <text
                key={`x-${p.date}`}
                x={xFor(i)}
                y={CHART_HEIGHT - PADDING_BOTTOM + 15}
                textAnchor="middle"
                fontSize="10"
                className={
                  hoveredDay === i
                    ? 'fill-black dark:fill-white font-bold tabular-nums'
                    : 'fill-gray-500 dark:fill-gray-500 tabular-nums'
                }
              >
                {dayNum}
              </text>
            )
          })}

          {/* Вертикальная линия при hover */}
          {hoveredDay !== null && current[hoveredDay]?.percent >= 0 && (
            <line
              x1={xFor(hoveredDay)}
              y1={PADDING_TOP}
              x2={xFor(hoveredDay)}
              y2={CHART_HEIGHT - PADDING_BOTTOM}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2 2"
              className="text-gray-400 dark:text-neutral-600"
              pointerEvents="none"
            />
          )}
        </svg>

        {/* Тултип */}
        {hoveredDay !== null && current[hoveredDay]?.percent >= 0 && (
          <div
            className="absolute top-0 transform -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10"
            style={{
              left: `calc(${(xFor(hoveredDay) / chartWidth) * 100}% )`,
            }}
          >
            {hoveredDay + 1}: {current[hoveredDay].percent}%
          </div>
        )}
      </div>
    </div>
  )
}

function average(points: PeriodStats[]): number {
  const valid = points.filter((p) => p.percent >= 0)
  if (valid.length === 0) return 0
  const sum = valid.reduce((acc, p) => acc + p.percent, 0)
  return Math.round(sum / valid.length)
}