// Одна страница заметки
export type NotePage = {
  id: string
  index: number
  template: PageTemplate
  snapshot: any
}

// Тип шаблона страницы
export type PageTemplate = 'blank' | 'grid' | 'lines' | 'dots' | 'custom'

// Данные холста заметки — массив страниц
export type CanvasData = {
  pages: NotePage[]
  currentPage: number
}