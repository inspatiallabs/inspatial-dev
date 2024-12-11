/*##############################################(GENERATE-UNIQUE-ID-UTIL)##############################################*/

/**
 * Generates a cryptographically secure unique identifier using modern crypto API.
 *
 * @returns {string} A prefixed UUID v4 string (e.g., 'in_123e4567-e89b-12d3-a456-426614174000')
 *
 * @example
 * // Generate a single unique ID
 * const id = generateUniqueId();
 * // => 'in_123e4567-e89b-12d3-a456-426614174000'
 *
 * @example
 * // Generate multiple unique IDs
 * const ids = Array.from({ length: 3 }, generateUniqueId);
 * // => [
 * //   'in_123e4567-e89b-12d3-a456-426614174000',
 * //   'in_987fcdeb-51a2-43f7-b321-426614174000',
 * //   'in_a1b2c3d4-e5f6-47g8-h9i0-426614174000'
 * // ]
 */
export function generateUniqueId(): string {
  return `in_${crypto.randomUUID()}`;
}
