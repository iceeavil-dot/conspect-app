'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal, Trash2, Check } from 'lucide-react'
import type { PlannerTask } from '@/lib/planner'

type TaskRowProps = {
  task: PlannerTask
  onToggleDone: () => void
  onCyclePriority: () => void
  onDelete: () => void
}

// Цвет кружка приоритета
function getPriorityColor(priority: 'none' | 'yellow' | 'red'): string {
  if (priority === 'red') return 'bg-red-500'
  if (priority === 'yellow') return 'bg-yellow-400'
  return 'border border-gray-300 dark:border-neutral-700 bg-transparent'
}

export function TaskRow({
  task,
  onToggleDone,
  onCyclePriority,
  onDelete,
}: TaskRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  function handleOpenMenu() {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    // Открываем влево-вниз от кнопки
    setCoords({
      x: rect.right - 160, // ширина меню 160px, прижимаем к правому краю кнопки
      y: rect.bottom + 4,
    })
    setMenuOpen(true)
  }

  // Закрытие по клику вне
  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  // Esc
  useEffect(() => {
    if (!menuOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [menuOpen])

  return (
    <div className="group flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-neutral-950 transition-colors">
      {/* 1. Чекбокс */}
      <button
        onClick={onToggleDone}
        className={`w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
          task.done
            ? 'bg-black dark:bg-white border-black dark:border-white'
            : 'border-gray-300 dark:border-neutral-700 hover:border-gray-500 dark:hover:border-neutral-500'
        }`}
        title={task.done ? 'Отметить как не выполненное' : 'Отметить выполненным'}
      >
        {task.done && (
          <Check
            size={12}
            className="text-white dark:text-black"
            strokeWidth={3}
          />
        )}
      </button>

      {/* 2. Текст */}
      <span
        className={`flex-1 min-w-0 text-sm truncate ${
          task.done
            ? 'text-gray-400 dark:text-gray-600 line-through'
            : 'text-black dark:text-white'
        }`}
      >
        {task.text}
      </span>

      {/* 3. Время (если есть) */}
      {task.time && (
        <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 tabular-nums">
          {task.time}
        </span>
      )}

      {/* 4. Приоритет (клик — переключение) */}
      <button
        onClick={onCyclePriority}
        className="shrink-0 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-800"
        title={
          task.priority === 'red'
            ? 'Красный (клик → снять)'
            : task.priority === 'yellow'
              ? 'Жёлтый (клик → красный)'
              : 'Без приоритета (клик → жёлтый)'
        }
      >
        <span
          className={`block w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}
        />
      </button>

      {/* 5. Меню */}
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation()
          if (menuOpen) {
            setMenuOpen(false)
          } else {
            handleOpenMenu()
          }
        }}
        className="shrink-0 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Меню"
      >
        <MoreHorizontal size={14} />
      </button>

      {/* Portal меню */}
      {mounted &&
        menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[100] w-40 py-1 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
            style={{ left: coords.x, top: coords.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setMenuOpen(false)
                onDelete()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 size={14} />
              Удалить
            </button>
          </div>,
          document.body
        )}
    </div>
  )
}