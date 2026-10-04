'use client'

type ProductivityProps = {
  /** Всего задач за день */
  total: number
  /** Выполнено задач */
  done: number
}

// Сообщение по уровню продуктивности
function getMessage(percent: number): string {
  if (percent === 0) return 'Самое время начать'
  if (percent < 50) return 'Продолжай в том же духе'
  if (percent < 70) return 'Ты легенда! Уже больше половины'
  if (percent < 85) return 'Ещё немного потрудись, ты сможешь!'
  if (percent < 100) return 'Вау.. такой огромный путь сделан! Последние рывки и ты всё сделаешь!'
  return 'Ты молодчинка! Можешь собой гордиться!'
}

// Эмодзи для акцента (по уровням)
function getEmoji(percent: number): string {
  if (percent === 0) return '🌱'
  if (percent < 50) return '💪'
  if (percent < 70) return '⭐'
  if (percent < 85) return '🔥'
  if (percent < 100) return '🚀'
  return '🏆'
}

export function Productivity({ total, done }: ProductivityProps) {
  // Нет задач вообще
  if (total === 0) {
    return (
      <div className="border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden">
        <div className="px-4 py-2 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Продуктивность
          </h3>
        </div>
        <div className="p-4 text-sm text-gray-400 dark:text-gray-600">
          Добавь дела на сегодня, чтобы отслеживать продуктивность.
        </div>
      </div>
    )
  }

  const percent = Math.round((done / total) * 100)
  const message = getMessage(percent)
  const emoji = getEmoji(percent)

  return (
    <div className="border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden">
      {/* Заголовок */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Продуктивность
        </h3>
      </div>

      {/* Тело */}
      <div className="p-4">
        {/* Большое число + прогресс-бар */}
        <div className="flex items-center gap-4 mb-3">
          <div className="text-4xl font-semibold text-black dark:text-white tabular-nums">
            {percent}%
          </div>

          {/* Прогресс-бар */}
          <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-neutral-900 overflow-hidden">
            <div
              className="h-full bg-black dark:bg-white transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Счётчик */}
        <div className="text-xs text-gray-500 dark:text-gray-500 mb-3">
          {done} из {total} дел выполнено
        </div>

        {/* Сообщение с эмодзи */}
        <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span className="text-lg leading-none shrink-0">{emoji}</span>
          <span>{message}</span>
        </div>
      </div>
    </div>
  )
}