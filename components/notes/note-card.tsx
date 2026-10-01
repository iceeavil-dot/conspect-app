'use client'

import { useState } from 'react'
import { Star, ChevronDown } from 'lucide-react'

type NoteCardProps = {
  title: string
  date: string
  coverUrl?: string | null
  isFavorite?: boolean
  onClick?: () => void
}

export function NoteCard({
  title,
  date,
  coverUrl,
  isFavorite = false,
  onClick,
}: NoteCardProps) {
  const [favorite, setFavorite] = useState(isFavorite)

  function handleFavoriteClick(e: React.MouseEvent) {
    e.stopPropagation() // чтобы не сработал клик по карточке
    setFavorite(!favorite)
  }

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer flex flex-col gap-2"
    >
      {/* Обложка */}
      <div className="relative aspect-[3/4] rounded-lg bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          // Пустая белая обложка — как чистый лист
          <div className="w-full h-full bg-gray-100 dark:bg-neutral-900" />
        )}

        {/* Звёздочка избранного */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          title={favorite ? 'Убрать из избранного' : 'В избранное'}
        >
          {favorite ? (
            <Star
              size={18}
              className="text-yellow-500 fill-yellow-500"
            />
          ) : (
            <Star
              size={18}
              className="text-gray-400 dark:text-gray-500"
            />
          )}
        </button>
      </div>

      {/* Название + стрелочка */}
      <div className="flex items-center justify-between gap-1 px-1">
        <h3 className="text-sm font-medium text-black dark:text-white truncate">
          {title}
        </h3>
        <ChevronDown
          size={14}
          className="text-gray-400 dark:text-gray-500 flex-shrink-0"
        />
      </div>

      {/* Дата */}
      <p className="text-xs text-gray-500 dark:text-gray-500 px-1 -mt-1">
        {date}
      </p>
    </div>
  )
}