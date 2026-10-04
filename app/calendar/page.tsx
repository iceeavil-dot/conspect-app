'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import {
  getMonthItems,
  createEvent,
  createCalendarTask,
  updateCalendarItem,
  deleteCalendarItem,
  type CalendarItem,
} from '@/lib/calendar'
import { CreateItemModal } from '@/components/calendar/create-item-modal'
import { DayItemsModal } from '@/components/calendar/day-items-modal'

const MONTHS_RU_FULL = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstWeekdayOfMonth(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay()
  return (jsDay + 6) % 7
}

export default function CalendarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [items, setItems] = useState<CalendarItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')

  // Режим редактирования
  const [editingItem, setEditingItem] = useState<CalendarItem | null>(null)

  // Модалка со списком всех дел дня
  const [dayListOpen, setDayListOpen] = useState(false)
  const [dayListDate, setDayListDate] = useState<string>('')

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

  const load = useCallback(async () => {
    setItemsLoading(true)
    const data = await getMonthItems(year, month)
    setItems(data)
    setItemsLoading(false)
  }, [year, month])

  useEffect(() => {
    if (loading) return
    load()
  }, [loading, load])

  function handlePrevMonth() {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  function handleNextMonth() {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  function handleToday() {
    const today = new Date()
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  // Клик по ПУСТОМУ месту — создание
  function handleEmptyClick(dateStr: string) {
    setSelectedDate(dateStr)
    setEditingItem(null)
    setModalOpen(true)
  }

  // Клик по ЭЛЕМЕНТУ — редактирование
  function handleItemClick(item: CalendarItem) {
    setSelectedDate(item.date)
    setEditingItem(item)
    setModalOpen(true)
  }

  // Клик на "+N ещё" — модалка со списком
  function handleShowAllClick(dateStr: string) {
    setDayListDate(dateStr)
    setDayListOpen(true)
  }

  // Создание
  async function handleCreateEvent(
    text: string,
    time: string,
    endTime: string
  ) {
    const item = await createEvent(selectedDate, text, time, endTime)
    if (item) setItems((prev) => [...prev, item])
  }

  async function handleCreateTask(
    text: string,
    time: string | null,
    priority: 'none' | 'yellow' | 'red'
  ) {
    const item = await createCalendarTask(selectedDate, text, time, priority)
    if (item) setItems((prev) => [...prev, item])
  }

  // Обновление
  async function handleUpdate(
    id: string,
    updates: {
      text: string
      time: string | null
      end_time: string | null
      priority: 'none' | 'yellow' | 'red'
    }
  ) {
    const ok = await updateCalendarItem(id, updates)
    if (ok) {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, ...updates } : it))
      )
    }
  }

  // Удаление
  async function handleDelete(id: string) {
    const ok = await deleteCalendarItem(id)
    if (ok) {
      setItems((prev) => prev.filter((it) => it.id !== id))
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

  const daysInMonth = getDaysInMonth(year, month)
  const firstWeekday = getFirstWeekdayOfMonth(year, month)
  const todayStr = formatDate(new Date())

  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7
  const cells: (number | null)[] = []
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstWeekday + 1
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push(null)
    } else {
      cells.push(dayNum)
    }
  }

  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />

      <main className="px-4 md:px-6 py-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-xl font-semibold text-black dark:text-white">
            Календарь
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={handleToday}
              className="px-4 py-1 rounded-md text-sm font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 min-w-[150px]"
              title="Перейти к текущему месяцу"
            >
              {MONTHS_RU_FULL[month]} {year}
            </button>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 text-black dark:text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Сетка календаря */}
        <div className="border-2 border-gray-300 dark:border-neutral-700 rounded-lg overflow-hidden">
          {/* Заголовок с днями недели */}
          <div className="grid grid-cols-7 bg-gray-100 dark:bg-neutral-900 border-b-2 border-gray-300 dark:border-neutral-700">
            {WEEKDAYS_SHORT.map((day) => (
              <div
                key={day}
                className="py-2.5 text-center text-xs font-semibold text-gray-600 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {weeks.map((week, wi) => (
            <div
              key={wi}
              className="grid grid-cols-7 border-b-2 border-gray-300 dark:border-neutral-700 last:border-b-0"
            >
              {week.map((dayNum, di) => {
                if (dayNum === null) {
                  return (
                    <div
                      key={di}
                      className="min-h-[110px] border-r-2 border-gray-300 dark:border-neutral-700 last:border-r-0 bg-gray-50 dark:bg-neutral-950/50"
                    />
                  )
                }

                const dateStr = formatDate(new Date(year, month, dayNum))
                const isToday = dateStr === todayStr
                const dayItems = items.filter((it) => it.date === dateStr)

                return (
                  <div
                    key={di}
                    onClick={() => handleEmptyClick(dateStr)}
                    className="min-h-[110px] p-2 border-r-2 border-gray-300 dark:border-neutral-700 last:border-r-0 hover:bg-gray-50 dark:hover:bg-neutral-950 transition-colors cursor-pointer"
                  >
                    {/* Число */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div
                        className={`w-6 h-6 flex items-center justify-center text-xs font-semibold rounded-full tabular-nums ${
                          isToday
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {dayNum}
                      </div>
                    </div>

                    {/* Список элементов */}
                    <div className="space-y-1">
                      {dayItems.slice(0, 3).map((item) => (
                        <button
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleItemClick(item)
                          }}
                          className="w-full text-left px-1 py-0.5 -mx-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 active:bg-gray-200 dark:active:bg-neutral-700 transition-colors"
                        >
                          <div className="flex items-start gap-1">
                            <span className="shrink-0 text-xs mt-px">
                              {item.is_event ? '🕐' : '☐'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-gray-800 dark:text-gray-200 truncate leading-tight">
                                {item.text}
                              </div>
                              {(item.time || item.end_time) && (
                                <div className="text-[10px] italic text-gray-500 dark:text-gray-500 tabular-nums leading-tight">
                                  {item.time}
                                  {item.end_time && `–${item.end_time}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}

                      {dayItems.length > 3 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShowAllClick(dateStr)
                          }}
                          className="w-full text-left text-xs text-gray-500 dark:text-gray-500 hover:text-black dark:hover:text-white px-1 py-0.5 -mx-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                        >
                          +{dayItems.length - 3} ещё
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Модалка создания/редактирования */}
        <CreateItemModal
          open={modalOpen}
          date={selectedDate}
          editingItem={editingItem}
          onClose={() => {
            setModalOpen(false)
            setEditingItem(null)
          }}
          onCreateEvent={handleCreateEvent}
          onCreateTask={handleCreateTask}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />

        {/* Модалка со списком дел дня */}
        <DayItemsModal
          open={dayListOpen}
          date={dayListDate}
          items={items.filter((it) => it.date === dayListDate)}
          onClose={() => setDayListOpen(false)}
          onPickItem={(item) => {
            setDayListOpen(false)
            handleItemClick(item)
          }}
        />

        {itemsLoading && (
          <div className="text-center text-xs text-gray-400 dark:text-gray-600 mt-4">
            Загрузка событий...
          </div>
        )}
      </main>
    </div>
  )
}