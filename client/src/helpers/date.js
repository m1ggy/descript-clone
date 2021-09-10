export function formatDateLocale(
  date,
  locale = 'en-US',
  options = {
    day: 'numeric',
    year: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
  }
) {
  return new Date(date).toLocaleDateString(locale, options);
}
