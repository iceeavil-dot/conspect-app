'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { TimeTable } from '@/components/planner/time-table'
import { CreateTaskModal } from '@/components/planner/create-task-modal'
import { TaskList } from '@/components/planner/task-list'
import {
  getTasksByDate,
  createTask,
  toggleTaskDone,
  updateTaskPriority,
  deleteTask,
  type PlannerTask,
} from '@/lib/planner'

// Формат даты → YYYY-MM-DD
function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Красивое название даты
function formatHumanDate(d: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)

  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Завтра'
  if (diffDays === -1) return 'Вчера'

  const months = [
    'янв', 'фев', 'мар', 'апр', 'мая', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

// Сортировка: сначала с временем (по времени), потом без
function sortTasks(a: PlannerTask, b: PlannerTask): number {
  if (a.time && !b.time) return -1
  if (!a.time && b.time) return 1
  if (a.time && b.time) return a.time.localeCompare(b.time)
  return a.created_at.localeCompare(b.created_at)
}

export default function PlannerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date())

  const [tasks, setTasks] = useState<PlannerTask[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [presetTime, setPresetTime] = useState<string | null>(null)

  // Проверка авторизации
  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setLoading(false)
    }
    check()
  }, [router])

  // Загрузка задач при смене даты
  useEffect(() => {
    if (loading) return
    const dateStr = formatDate(date)
    getTasksByDate(dateStr).then((data) => {
      setTasks(data.sort(sortTasks))
    })
  }, [date, loading])

  function handlePrevDay() {
    const d = new Date(date)
    d.setDate(d.getDate() - 1)
    setDate(d)
  }

  function handleNextDay() {
    const d = new Date(date)
    d.setDate(d.getDate() + 1)
    setDate(d)
  }

  function handleToday() {
    setDate(new Date())
  }

  // Открыть модалку с предустановленным временем
  function handleAddAtHour(hour: string) {
    setPresetTime(hour)
    setModalOpen(true)
  }

  // Открыть модалку без времени
  function handleAddEmpty() {
    setPresetTime(null)
    setModalOpen(true)
  }

  // Создание задачи
  async function handleCreateTask(text: string, time: string | null) {
    const dateStr = formatDate(date)
    const newTask = await createTask(dateStr, text, time)
    if (newTask) {
      setTasks((prev) => [...prev, newTask].sort(sortTasks))
    }
  }

  // Переключить done
  async function handleToggleDone(id: string, done: boolean) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)))
    const ok = await toggleTaskDone(id, done)
    if (!ok) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !done } : t)))
    }
  }

  // Циклическое переключение приоритета: none → yellow → red → none
  async function handleCyclePriority(
    id: string,
    current: 'none' | 'yellow' | 'red'
  ) {
    const next: 'none' | 'yellow' | 'red' =
      current === 'none' ? 'yellow' : current === 'yellow' ? 'red' : 'none'

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, priority: next } : t))
    )
    const ok = await updateTaskPriority(id, next)
    if (!ok) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, priority: current } : t))
      )
    }
  }

  // Удаление с подтверждением
  async function handleDeleteTask(id: string, text: string) {
    const confirmed = window.confirm(`Удалить задачу «${text}»?`)
    if (!confirmed) return

    const ok = await deleteTask(id)
    if (ok) {
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } else {
      alert('Не удалось удалить')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Header />
        <div className="p-6 text-gray-500 dark:text-gray-400">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />

      <main className="px-4 md:px-6 py-6">
        {/* Шапка с датой и кнопкой "+ Дело" */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-xl font-semibold text-black dark:text-white">
            Планер
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={handleToday}
              className="px-3 py-1 rounded-md text-sm font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 min-w-[100px]"
              title="Перейти к сегодня"
            >
              {formatHumanDate(date)}
            </button>

            <button
              onClick={handleNextDay}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white"
            >
              <ChevronRight size={18} />
            </button>

            <button
              onClick={handleAddEmpty}
              className="ml-2 flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium bg-black text-white dark:bg-white dark:text-black hover:opacity-80"
            >
              <Plus size={14} strokeWidth={2.5} />
              Дело
            </button>
          </div>
        </div>

        {/* Основной layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Левая колонка: Time Table */}
          <div>
            <TimeTable tasks={tasks} onAddAtHour={handleAddAtHour} />
          </div>

          {/* Правая колонка: To-do + Дневник */}
          <div className="flex flex-col gap-4">
            <TaskList
              tasks={tasks}
              onToggleDone={handleToggleDone}
              onCyclePriority={handleCyclePriority}
              onDelete={handleDeleteTask}
            />

            <div className="border border-dashed border-gray-300 dark:border-neutral-800 rounded-lg p-6 text-center text-gray-400 dark:text-gray-600">
              Дневник — следующая часть
            </div>
          </div>
        </div>
      </main>

      {/* Модалка создания задачи */}
      <CreateTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateTask}
        presetTime={presetTime}
      />
    </div>
  )
}