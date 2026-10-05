'use client'

import type { Note } from '@/lib/notes'

export type TemplateType = 'blank' | 'grid' | 'lines' | 'dots' | 'custom'

type TemplatePreviewProps = {
  /** Тип шаблона */
  template: TemplateType
  /** URL своего шаблона (если template = 'custom') */
  templateUrl?: string | null
  /** Размер превью */
  size?: 'sm' | 'md' | 'lg'
  /** Показать рамку */
  bordered?: boolean
}

const SIZES = {
  sm: { width: 48, height: 64, gap: 6 },
  md: { width: 64, height: 86, gap: 8 },
  lg: { width: 120, height: 160, gap: 12 },
}

export function TemplatePreview({
  template,
  templateUrl,
  size = 'md',
  bordered = true,
}: TemplatePreviewProps) {
  const { width, height } = SIZES[size]

  return (
    <div
      className={`relative overflow-hidden ${
        bordered
          ? 'border border-gray-300 dark:border-neutral-700 rounded-sm'
          : ''
      } bg-white dark:bg-neutral-950`}
      style={{ width, height }}
    >
      {template === 'grid' && <GridTemplate />}
      {template === 'lines' && <LinesTemplate />}
      {template === 'dots' && <DotsTemplate />}
      {template === 'custom' && templateUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={templateUrl}
          alt="Свой шаблон"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Шаблон: Клетка
// ─────────────────────────────────────────────────────────────

function GridTemplate() {
  // Шаг сетки: 8px
  const size = 8
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="grid-pattern"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${size} 0 L 0 0 0 ${size}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-gray-300 dark:text-neutral-800"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// Шаблон: Линии
// ─────────────────────────────────────────────────────────────

function LinesTemplate() {
  const lineGap = 12
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="lines-pattern"
          width="100%"
          height={lineGap}
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1={lineGap - 0.5}
            x2="100%"
            y2={lineGap - 0.5}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-gray-300 dark:text-neutral-800"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lines-pattern)" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// Шаблон: Точки
// ─────────────────────────────────────────────────────────────

function DotsTemplate() {
  const size = 10
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="dots-pattern"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r="0.7"
            fill="currentColor"
            className="text-gray-400 dark:text-neutral-700"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots-pattern)" />
    </svg>
  )
}