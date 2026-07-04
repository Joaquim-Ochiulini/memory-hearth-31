/**
 * Pure date helpers. Keep this module free of React and side-effects.
 * All ISO dates ("YYYY-MM-DD") are parsed as UTC and formatted in UTC to
 * keep server and client rendering identical (no hydration mismatch).
 */

export function formatMonth(iso: string, locale = "pt-BR") {
  return new Date(iso).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatLongDate(iso: string, locale = "pt-BR") {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function yearOf(iso: string) {
  return new Date(iso + "T00:00:00Z").getUTCFullYear();
}

