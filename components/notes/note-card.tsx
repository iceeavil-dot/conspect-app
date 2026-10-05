'use client'

import { Star } from 'lucide-react'
import { NoteCardMenu } from './note-card-menu'

type NoteCardProps = {
  noteId: string
  title: string
  date: string
  coverUrl?: string | null
  isFavorite?: boolean
  onToggleFavorite?: () => void
  onRename?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  onCoverChange?: (newUrl: string | null) => void
  onClick?: () => void
}

export function NoteCard({
  noteId,
  title,
  date,
  coverUrl,
  isFavorite = false,
  onToggleFavorite,
  onRename,
  onDuplicate,
  onDelete,
  onCoverChange,
  onClick,
}: NoteCardProps) {
  function handleFavoriteClick(e: React.MouseEvent) {
    e.stopPropagation()
    onToggleFavorite?.()
  }

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer flex flex-col gap-2"
    >
      {/* Обложка */}
      <div className="relative aspect-[3/4] rounded-lg bg-gradient-to-b from-gray-100 to-gray-300 dark:from-neutral-900 dark:to-neutral-800 border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-300 dark:from-neutral-900 dark:to-neutral-800" />
        )}

        {/* Звёздочка избранного */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200/50 dark:hover:bg-neutral-800/50 transition-colors"
          title={isFavorite ? 'Убрать из избранного' : 'В избранное'}
        >
          <Star
            size={18}
            className={
              isFavorite
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-400 dark:text-gray-500'
            }
          />
        </button>
      </div>

      {/* Название + меню */}
      <div className="flex items-center justify-between gap-1 px-1">
        <h3 className="text-sm font-medium text-black dark:text-white truncate">
          {title}
        </h3>

        <NoteCardMenu
          noteId={noteId}
          currentCoverUrl={coverUrl ?? null}
          onRename={onRename ?? (() => {})}
          onDuplicate={onDuplicate ?? (() => {})}
          onDelete={onDelete ?? (() => {})}
          onCoverChange={onCoverChange ?? (() => {})}
        />
      </div>

      {/* Дата */}
      <p className="text-xs text-gray-500 dark:text-gray-500 px-1 -mt-1">
        {date}
      </p>
    </div>
  )
}