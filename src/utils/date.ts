/**
 * Pure helpers. Keep this module free of React and side-effects.
 */

export function formatMonth(iso: string, locale = "pt-BR") {
  return new Date(iso).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}
