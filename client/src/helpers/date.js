export function formatDateLocale(date, locale, options) {
  return new Date(date).toLocaleDateString(locale, options);
}
