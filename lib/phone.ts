/**
 * Phone number normalization for Indian mobile numbers.
 *
 * Handles common input formats:
 *   - "9876543210"      → "+919876543210"
 *   - "09876543210"     → "+919876543210"  (drops leading 0)
 *   - "919876543210"    → "+919876543210"  (already country-coded)
 *   - "+91 98765 43210" → "+919876543210"  (strips spaces, +, dashes)
 *
 * Returns null for anything that isn't a valid 10-digit Indian mobile
 * (must start with 6, 7, 8, or 9 after normalization — TRAI rule).
 */
export function normalizeIndianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  let cleaned: string;
  if (digits.length === 12 && digits.startsWith("91")) {
    cleaned = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    cleaned = digits.slice(1);
  } else if (digits.length === 10) {
    cleaned = digits;
  } else {
    return null;
  }

  if (!/^[6-9]\d{9}$/.test(cleaned)) return null;
  return `+91${cleaned}`;
}

export function isValidIndianPhone(raw: string): boolean {
  return normalizeIndianPhone(raw) !== null;
}

/** Mask for logging: "98****3210" */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return "********";
  return `${digits.slice(0, 2)}****${digits.slice(-4)}`;
}
