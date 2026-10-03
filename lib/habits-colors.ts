// Палитра из 12 пастельных цветов.
// Цвет дня вычисляется по формуле: day % 12 → индекс в массиве
// Это даёт стабильные цвета (день 1 всегда один и тот же цвет)

export const HABIT_COLORS = [
   '#F472B6', // розовый
  '#FB923C', // оранжевый
  '#A3E635', // лайм
  '#4ADE80', // зелёный
  '#2DD4BF', // бирюзовый
  '#38BDF8', // голубой
  '#60A5FA', // синий
  '#A78BFA', // сиреневый
  '#C084FC', // фиолетовый
  '#F87171', // красный
  '#FBBF24', // жёлтый
  '#FB7185', // коралловый
]

// Получить цвет по номеру дня месяца (1-31)
export function getDayColor(day: number): string {
  return HABIT_COLORS[(day - 1) % HABIT_COLORS.length]
}

// Светлая версия цвета (для фона пустой клетки, если понадобится)
export function getDayColorLight(day: number): string {
  const color = getDayColor(day)
  return color + '20' // 12% прозрачности (HEX alpha)
}
// Месяцы на русском (для заголовка)
export const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
]

// Дни недели на русском (короткие)
// Порядок: Пн, Вт, Ср, Чт, Пт, Сб, Вс
export const WEEKDAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// Получить количество дней в месяце
// month — 0-indexed (0 = январь, 11 = декабрь)
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

// Получить день недели для первого числа месяца
// Возвращает 0-6, где 0 = понедельник, 6 = воскресенье
export function getFirstWeekdayOfMonth(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay()  // 0 = воскресенье, 1 = понедельник, ...
  // Приводим к порядку: 0 = понедельник, ..., 6 = воскресенье
  return (jsDay + 6) % 7
}

// Формат даты YYYY-MM-DD (для Supabase)
export function formatDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}