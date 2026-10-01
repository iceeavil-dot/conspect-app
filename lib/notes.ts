import { createClient } from './supabase/client'

export type Note = {
  id: string
  title: string
  content: string
  canvas_data: string | null
  cover_url: string | null
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export async function getNotes(): Promise<Note[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('is_favorite', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Ошибка загрузки заметок:', error)
    return []
  }

  return data ?? []
}

export async function createNote(title: string = 'Новая Заметка'): Promise<Note | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('Пользователь не авторизован')
    return null
  }

  const { data, error } = await supabase
    .from('notes')
    .insert({ user_id: user.id, title })
    .select()
    .single()

  if (error) {
    console.error('Ошибка создания заметки:', error)
    return null
  }

  return data
}

export async function toggleFavorite(id: string, isFavorite: boolean): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('notes')
    .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Ошибка переключения избранного:', error)
    return false
  }

  return true
}

export async function deleteNote(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Ошибка удаления заметки:', error)
    return false
  }

  return true
}