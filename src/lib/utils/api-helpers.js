// Базовые утилиты для работы с API
export function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU').format(price);
}

export function formatDate(date) {
  if (!date) return "";
  try {
    // Парсим дату как локальную дату, чтобы избежать проблем с часовыми поясами
    const [year, month, day] = date.split('-');
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('ru-RU');
  } catch {
    return date;
  }
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
} 