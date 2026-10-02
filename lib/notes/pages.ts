import { CanvasData, NotePage, PageTemplate } from './types'

// Генерация уникального ID
export function generatePageId(): string {
  return 'p_' + Math.random().toString(36).substring(2, 10)
}

// Создание новой пустой страницы
export function createEmptyPage(
  index: number,
  template: PageTemplate = 'blank'
): NotePage {
  return {
    id: generatePageId(),
    index,
    template,
    snapshot: null,
  }
}

// Парсинг canvas_data из базы (с миграцией старого формата)
export function parseCanvasData(raw: string | null): CanvasData {
  // Если пусто — одна пустая страница
  if (!raw) {
    return {
      pages: [createEmptyPage(0)],
      currentPage: 0,
    }
  }

  try {
    const parsed = JSON.parse(raw)

    // Новый формат
    if (parsed.pages && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
      // ⚠️ Нормализуем индекс: если он вне границ — сбрасываем на 0
      let currentPage = parsed.currentPage ?? 0
      if (currentPage < 0 || currentPage >= parsed.pages.length) {
        console.warn('currentPage вне границ, сбрасываю на 0')
        currentPage = 0
      }

      return {
        pages: parsed.pages,
        currentPage,
      }
    }

    // Старый формат — один snapshot. Оборачиваем в массив
    return {
      pages: [
        {
          id: generatePageId(),
          index: 0,
          template: 'blank',
          snapshot: parsed,
        },
      ],
      currentPage: 0,
    }
  } catch (e) {
    console.error('Ошибка парсинга canvas_data:', e)
    return {
      pages: [createEmptyPage(0)],
      currentPage: 0,
    }
  }
}

// Сериализация для сохранения в базу
export function serializeCanvasData(data: CanvasData): string {
  return JSON.stringify(data)
}