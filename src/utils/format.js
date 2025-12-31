import { CATEGORIES } from '@shared/shop';

export function formatPrice(value) {
  return `¥${Number(value || 0).toLocaleString('zh-CN')}`;
}

export function formatDate(value, options = {}) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(date);
}

export function categoryName(categoryId) {
  return CATEGORIES.find((category) => category.id === categoryId)?.name || '好物';
}
