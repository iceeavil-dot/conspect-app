'use client'

type HabitDiamondProps = {
  /** Номер дня месяца (1-31) — определяет цвет */
  day: number
  /** Выполнена ли привычка в этот день */
  done: boolean
  /** Колбэк при клике */
  onClick?: () => void
  /** Отключён ли клик (например, будущие дни) */
  disabled?: boolean
  /** Цвет из палитры (если не указан — вычисляется по дню) */
  color?: string
}

export function HabitDiamond({
  day,
  done,
  onClick,
  disabled = false,
  color,
}: HabitDiamondProps) {
  // Если цвет не передан — берём из утилиты
  // (импорт делаем снаружи, чтобы не тянуть всю палитру в компонент)
  const fillColor = color ?? '#F472B6'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center transition-transform ${
        disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer hover:scale-110'
      } ${done ? '' : 'opacity-40 hover:opacity-60'}`}
      title={done ? 'Выполнено' : 'Не выполнено'}
    >
      {done ? (
        // Выполнено: цветной ромб с узором
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Узор: сетка из линий (один для всех клеток) */}
            <pattern
              id={`pattern-${day}`}
              x="0"
              y="0"
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 0,4 L 4,0 M -1,1 L 1,-1 M 3,5 L 5,3"
                stroke="white"
                strokeWidth="0.7"
                opacity="0.6"
              />
            </pattern>
          </defs>

          {/* Ромб с цветом дня */}
          <polygon
            points="14,1 27,14 14,27 1,14"
            fill={fillColor}
            stroke={fillColor}
            strokeWidth="1"
          />

          {/* Узор поверх ромба (внутри, обрезан по форме) */}
          <clipPath id={`clip-${day}`}>
            <polygon points="14,1 27,14 14,27 1,14" />
          </clipPath>
          <polygon
            points="14,1 27,14 14,27 1,14"
            fill={`url(#pattern-${day})`}
            clipPath={`url(#clip-${day})`}
          />
        </svg>
      ) : (
        // Не выполнено: пустая клетка (только тонкий серый контур)
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon
            points="14,2 26,14 14,26 2,14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-gray-300 dark:text-neutral-700"
            opacity="0.5"
          />
        </svg>
      )}
    </button>
  )
}