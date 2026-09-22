// Экранирование текста для вставки в HTML-шаблоны интерфейса: одна функция
// на app.ts и howto.ts (telesik-team#121; раньше две копии с разными
// наборами сущностей — howto не экранировал апостроф).
const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ENTITIES[c]!);
