'use client'

type DonutChartProps = {
  /** Общий % продуктивности (0-100) */
  percent: number
  /** Доля привычек в общем числе выполненных (0-100) */
  habitShare: number
  /** Доля задач в общем числе выполненных (0-100) */
  taskShare: number
  /** Размер в пикселях */
  size?: number
  /** Толщина кольца */
  thickness?: number
}

export function DonutChart({
  percent,
  habitShare,
  taskShare,
  size = 220,
  thickness = 40,
}: DonutChartProps) {
  const center = size / 2
  const radius = (size - thickness) / 2

  // Полная окружность в SVG = 2πr
  const circumference = 2 * Math.PI * radius

  // Длина дуги для каждой секции
  // habitShare и taskShare уже в процентах от ВСЕГО (0-100)
  // Значит в процентах от окружности: делим на 100, умножаем на circumference
  const habitLength = (habitShare / 100) * circumference
  const taskLength = (taskShare / 100) * circumference

  // Цвета
  const habitColor = 'rgb(209, 213, 219)'   // светло-серый
  const taskColor = 'rgb(75, 85, 99)'       // тёмно-серый

  // Общая длина заполненного = percent/100 * circumference
  // Но habitLength + taskLength уже = percent% (по определению share)
  // Проверим на всякий случай

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Фон (пустота) — тонкая светлая окружность */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="text-gray-200 dark:text-neutral-800"
          opacity={0.5}
        />

        {/* Сектор 1: Привычки */}
        {habitShare > 0 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={habitColor}
            strokeWidth={thickness}
            strokeDasharray={`${habitLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="butt"
          />
        )}

        {/* Сектор 2: Задачи — начинается после привычек */}
        {taskShare > 0 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={taskColor}
            strokeWidth={thickness}
            strokeDasharray={`${taskLength} ${circumference}`}
            strokeDashoffset={-habitLength}
            strokeLinecap="butt"
          />
        )}
      </svg>

      {/* Текст в центре */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-4xl font-semibold text-black dark:text-white tabular-nums">
          {percent}%
        </span>
      </div>
    </div>
  )
}