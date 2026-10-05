import { createClient } from './supabase/client'

// ─────────────────────────────────────────────────────────────
// Загрузить файл в bucket
// ─────────────────────────────────────────────────────────────

export async function uploadFile(
  bucket: 'covers' | 'templates',
  file: File
): Promise<string | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Уникальное имя: user_id/1234567890.ext
  const ext = file.name.split('.').pop() || 'jpg'
  const fileName = `${user.id}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error(`Ошибка загрузки в ${bucket}:`, error)
    return null
  }

  // Получаем публичный URL
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)

  return data.publicUrl
}

// ─────────────────────────────────────────────────────────────
// Удалить файл из bucket по URL
// ─────────────────────────────────────────────────────────────

export async function deleteFileByUrl(
  bucket: 'covers' | 'templates',
  url: string
): Promise<boolean> {
  const supabase = createClient()

  // Из URL вытаскиваем путь (после /object/public/{bucket}/)
  const marker = `/object/public/${bucket}/`
  const idx = url.indexOf(marker)
  if (idx === -1) {
    console.error('Не удалось распознать URL:', url)
    return false
  }

  const path = url.substring(idx + marker.length)

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    console.error('Ошибка удаления файла:', error)
    return false
  }

  return true
}