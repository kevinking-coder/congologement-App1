/**
 * DRC phone number validation.
 *
 * A valid DRC mobile number is "+243" followed by exactly 9 digits. The leading
 * digits after the country code are typically 8 or 9 (e.g. +243 8XX XXX XXX).
 */

const DRC_RE = /^\+243[0-9]{9}$/;

/** Strip spaces, dashes and parentheses for a forgiving comparison. */
export function normalizePhone(raw: string): string {
  return raw.replace(/[^0-9+]/g, '');
}

/**
 * Returns true when `raw` is a syntactically valid DRC phone number.
 * Accepts optional spaces/dashes between groups (they are stripped first).
 */
export function isValidDrcPhone(raw: string): boolean {
  const cleaned = normalizePhone(raw);
  return DRC_RE.test(cleaned);
}
