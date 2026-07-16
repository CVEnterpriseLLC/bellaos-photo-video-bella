export const MINIMUM_PASSWORD_LENGTH = 8;

export function isValidPassword(password: string) {
  return password.length >= MINIMUM_PASSWORD_LENGTH;
}
