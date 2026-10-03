import { createClient } from './supabase/client'

// Тип привычки
export type Habit = {
  id: string
  user_id: string
  name: string
  created_at: string
}

// Тип отметки
export type HabitLog = {
  id: string
  habit_id: string
  user_id: string
  date: string         // YYYY-MM-DD
  done: boolean
}

// Получить все привычки пользователя
export async function getHabits(): Promise<Habit[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Ошибка загрузки привычек:', error)
    return []
  }

  return data ?? []
}

// Создать привычку
export async function createHabit(name: string): Promise<Habit | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('habits')
    .insert({ user_id: user.id, name: name.trim() })
    .select()
    .single()

  if (error) {
    console.error('Ошибка создания привычки:', error)
    return null
  }

  return data
}

// Переименовать привычку
export async function renameHabit(id: string, newName: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('habits')
    .update({ name: newName.trim() })
    .eq('id', id)

  if (error) {
    console.error('Ошибка переименования привычки:', error)
    return false
  }

  return true
}

// Удалить привычку (вместе с её логами — через ON DELETE CASCADE)
export async function deleteHabit(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Ошибка удаления привычки:', error)
    return false
  }

  return true
}

// Получить все отметки за период (месяц)
export async function getHabitLogs(
  fromDate: string,   // YYYY-MM-DD
  toDate: string      // YYYY-MM-DD
): Promise<HabitLog[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .gte('date', fromDate)
    .lte('date', toDate)

  if (error) {
    console.error('Ошибка загрузки отметок:', error)
    return []
  }

  return data ?? []
}

// Переключить отметку дня
// Если есть — обновляем, если нет — создаём
export async function toggleHabitLog(
  habitId: string,
  date: string,        // YYYY-MM-DD
  done: boolean
): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // Пытаемся найти существующую отметку
  const { data: existing } = await supabase
    .from('habit_logs')
    .select('id')
    .eq('habit_id', habitId)
    .eq('date', date)
    .maybeSingle()

  if (existing) {
    // Обновляем
    const { error } = await supabase
      .from('habit_logs')
      .update({ done })
      .eq('id', existing.id)

    if (error) {
      console.error('Ошибка обновления отметки:', error)
      return false
    }
  } else {
    // Создаём
    const { error } = await supabase
      .from('habit_logs')
      .insert({
        habit_id: habitId,
        user_id: user.id,
        date,
        done,
      })

    if (error) {
      console.error('Ошибка создания отметки:', error)
      return false
    }
  }

  return true
}