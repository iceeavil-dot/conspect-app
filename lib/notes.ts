import { createClient } from './supabase/client'

export type Note = {
  id: string
  title: string
  content: string
  canvas_data: string | null
  cover_url: string | null
  template: 'blank' | 'grid' | 'lines' | 'dots' | 'custom'
  template_url: string | null
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

export async function createNote(
  title: string = 'Новая Заметка',
  template: 'blank' | 'grid' | 'lines' | 'dots' | 'custom' = 'blank',
  templateUrl: string | null = null,
  coverUrl: string | null = null
): Promise<Note | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('Пользователь не авторизован')
    return null
  }

  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      title,
      template,
      template_url: templateUrl,
      cover_url: coverUrl,
    })
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

// Переименовать заметку
export async function renameNote(id: string, newTitle: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('notes')
    .update({ title: newTitle, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Ошибка переименования:', error)
    return false
  }

  return true
}

// Дублировать заметку
export async function duplicateNote(id: string): Promise<Note | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Загружаем исходную заметку
  const { data: original, error: loadError } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single()

  if (loadError || !original) {
    console.error('Ошибка загрузки для дублирования:', loadError)
    return null
  }

  // Создаём копию
  const { data: copy, error: copyError } = await supabase
    .from('notes')
    .insert({
      user_id: user.id,
      title: `${original.title} (копия)`,
      content: original.content,
      canvas_data: original.canvas_data,
      cover_url: original.cover_url,
      is_favorite: false,
    })
    .select()
    .single()

  if (copyError) {
    console.error('Ошибка дублирования:', copyError)
    return null
  }

  return copy
}
// ─────────────────────────────────────────────────────────────
// Обновить обложку заметки
// ─────────────────────────────────────────────────────────────

export async function updateNoteCover(
  id: string,
  coverUrl: string | null
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('notes')
    .update({ cover_url: coverUrl, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Ошибка обновления обложки:', error)
    return false
  }

  return true
}