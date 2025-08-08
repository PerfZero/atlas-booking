// Базовые утилиты для работы с API
export function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU').format(price);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU');
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