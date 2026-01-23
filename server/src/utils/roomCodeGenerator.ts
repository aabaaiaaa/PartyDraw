/**
 * Room Code Generator
 * Generates 6-character alphanumeric room codes (e.g., "PARTY7")
 */

// Characters to use for room codes (uppercase letters and digits, excluding confusing chars like 0/O, 1/I/L)
const CHARACTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Generates a random 6-character room code
 * @returns A 6-character alphanumeric room code
 */
export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
    code += CHARACTERS[randomIndex];
  }
  return code;
}

/**
 * Generates a unique room code that doesn't exist in the provided set
 * @param existingCodes - Set of existing room codes to avoid
 * @param maxAttempts - Maximum number of attempts before throwing (default: 100)
 * @returns A unique 6-character room code
 */
export function generateUniqueRoomCode(
  existingCodes: Set<string>,
  maxAttempts: number = 100
): string {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRoomCode();
    if (!existingCodes.has(code)) {
      return code;
    }
  }
  throw new Error('Failed to generate unique room code after maximum attempts');
}

/**
 * Validates a room code format
 * @param code - The code to validate
 * @returns true if the code is a valid 6-character alphanumeric string
 */
export function isValidRoomCode(code: string): boolean {
  if (typeof code !== 'string' || code.length !== 6) {
    return false;
  }
  return /^[A-Z0-9]{6}$/.test(code);
}
