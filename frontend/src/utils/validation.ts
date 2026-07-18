/**
 * Preset regex patterns for common input validations.
 */
export const validationPatterns = {
  // Standard compliant email pattern
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  numeric: /^\d+$/,
};

/**
 * Checks if a string meets complexity rules.
 */
export function isPasswordStrong(password: string): boolean {
  return validationPatterns.strongPassword.test(password);
}

/**
 * Checks if email matches general compliance boundaries.
 */
export function isValidEmail(email: string): boolean {
  return validationPatterns.email.test(email);
}
