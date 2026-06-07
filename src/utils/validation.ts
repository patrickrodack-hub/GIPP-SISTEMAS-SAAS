/**
 * Utility functions for validating global system configuration fields.
 */

/**
 * Validates whether a string is a properly formatted E-mail address.
 * Accepts empty values as valid (handled at form required field checking).
 */
export function validateEmail(email: string): boolean {
  if (!email) return true;
  // Standard RFC 5322 email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates whether a WhatsApp/Phone number is valid.
 * Strips formatting characters and checks for standard length.
 * WhatsApp numbers must have a country code or regional area code, containing 10 to 15 digits.
 */
export function validateWhatsApp(phone: string): boolean {
  if (!phone) return true;
  // Remove spaces, parentheses, slashes, dashes, and plus sign
  const digits = phone.replace(/[+\s().-]/g, '');
  // Brazilian numbers usually have 10 (without 9) or 11 (with 9) digits.
  // International format might have 12-14 digits (including country code, e.g., 5511999999999).
  // General validation: only digits and length between 10 and 15
  const isAllNumbers = /^\d+$/.test(digits);
  return isAllNumbers && digits.length >= 10 && digits.length <= 15;
}

/**
 * Formats a raw number string into a clean Brazilian WhatsApp format.
 */
export function formatWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}
