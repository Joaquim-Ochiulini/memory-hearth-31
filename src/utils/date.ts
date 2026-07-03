/**
 * Pure date helpers. Keep this module free of React and side-effects.
 */

export function formatMonth(iso: string, locale = "pt-BR") {
  return new Date(iso).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
}

export function formatLongDate(iso: string, locale = "pt-BR") {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function yearOf(iso: string) {
  return new Date(iso).getFullYear();
}
