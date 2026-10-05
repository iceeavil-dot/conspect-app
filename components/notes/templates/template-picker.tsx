'use client'

import { TemplatePreview, type TemplateType } from './template-preview'

type TemplatePickerProps = {
  value: TemplateType
  onChange: (t: TemplateType) => void
  /** Показывать ли кнопку «Свой» */
  showCustom?: boolean
}

const TEMPLATES: { value: TemplateType; label: string }[] = [
  { value: 'blank', label: 'Пустой' },
  { value: 'grid', label: 'Клетка' },
  { value: 'lines', label: 'Линия' },
  { value: 'dots', label: 'Точки' },
  { value: 'custom', label: 'Свой' },
]

export function TemplatePicker({
  value,
  onChange,
  showCustom = true,
}: TemplatePickerProps) {
  const templates = showCustom
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.value !== 'custom')

  return (
    <div className="flex gap-3 flex-wrap">
      {templates.map((t) => {
        const selected = value === t.value
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div
              className={`rounded-sm overflow-hidden transition-all ${
                selected
                  ? 'ring-2 ring-black dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-neutral-900'
                  : 'group-hover:ring-1 group-hover:ring-gray-300 dark:group-hover:ring-neutral-700'
              }`}
            >
              <TemplatePreview template={t.value} size="sm" bordered={false} />
            </div>
            <span
              className={`text-[10px] ${
                selected
                  ? 'text-black dark:text-white font-medium'
                  : 'text-gray-500 dark:text-gray-500'
              }`}
            >
              {t.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}