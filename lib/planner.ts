import { createClient } from './supabase/client'

// Типы
export type PlannerTask = {
  id: string
  user_id: string
  date: string          // YYYY-MM-DD
  text: string
  time: string | null   // "14:00" или null
  done: boolean
  priority: 'none' | 'yellow' | 'red'
  created_at: string
}

export type PlannerDay = {
  id: string
  user_id: string
  date: string
  note: string
  updated_at: string
}

// Загрузить все задачи на дату
export async function getTasksByDate(date: string): Promise<PlannerTask[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('planner_tasks')
    .select('*')
    .eq('date', date)
    .order('time', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Ошибка загрузки задач:', error)
    return []
  }

  return data ?? []
}

// Создать задачу
export async function createTask(
  date: string,
  text: string,
  time?: string | null,
  priority: 'none' | 'yellow' | 'red' = 'none'
): Promise<PlannerTask | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('planner_tasks')
    .insert({
      user_id: user.id,
      date,
      text: text.trim(),
      time: time ?? null,
      priority,
    })
    .select()
    .single()

  if (error) {
    console.error('Ошибка создания задачи:', error)
    return null
  }

  return data
}

// Переключить выполнено/не выполнено
export async function toggleTaskDone(id: string, done: boolean): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('planner_tasks')
    .update({ done })
    .eq('id', id)

  if (error) {
    console.error('Ошибка переключения задачи:', error)
    return false
  }

  return true
}

// Обновить приоритет
export async function updateTaskPriority(
  id: string,
  priority: 'none' | 'yellow' | 'red'
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('planner_tasks')
    .update({ priority })
    .eq('id', id)

  if (error) {
    console.error('Ошибка обновления приоритета:', error)
    return false
  }

  return true
}

// Обновить текст задачи
export async function updateTaskText(id: string, text: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('planner_tasks')
    .update({ text: text.trim() })
    .eq('id', id)

  if (error) {
    console.error('Ошибка обновления задачи:', error)
    return false
  }

  return true
}

// Удалить задачу
export async function deleteTask(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('planner_tasks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Ошибка удаления задачи:', error)
    return false
  }

  return true
}

// Загрузить дневник на дату
export async function getDayNote(date: string): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('planner_days')
    .select('note')
    .eq('date', date)
    .maybeSingle()

  if (error) {
    console.error('Ошибка загрузки дневника:', error)
    return ''
  }

  return data?.note ?? ''
}

// Сохранить дневник (upsert)
export async function saveDayNote(date: string, note: string): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('planner_days')
    .upsert(
      {
        user_id: user.id,
        date,
        note,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,date' }
    )

  if (error) {
    console.error('Ошибка сохранения дневника:', error)
    return false
  }

  return true
}