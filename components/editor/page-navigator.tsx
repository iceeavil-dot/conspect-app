'use client'

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { CanvasData } from '@/lib/notes/types'

type PageNavigatorProps = {
  data: CanvasData
  onPrevPage: () => void
  onNextPage: () => void
  onAddPage: () => void
}

export function PageNavigator({
  data,
  onPrevPage,
  onNextPage,
  onAddPage,
}: PageNavigatorProps) {
  const total = data.pages.length
  const current = data.currentPage
  const canPrev = current > 0
  const canNext = current < total - 1

  return (
    <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-black">
      {/* Листание страниц */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrevPage}
          disabled={!canPrev}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          title="Предыдущая страница"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-sm text-gray-700 dark:text-gray-300 px-3 min-w-[60px] text-center tabular-nums">
          {current + 1} / {total}
        </span>

        <button
          onClick={onNextPage}
          disabled={!canNext}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          title="Следующая страница"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Кнопка добавления страницы */}
      <button
        onClick={onAddPage}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-black text-white dark:bg-white dark:text-black hover:opacity-80"
        title="Добавить страницу"
      >
        <Plus size={16} strokeWidth={2.5} />
        Новая страница
      </button>
    </div>
  )
}