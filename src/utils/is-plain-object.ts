/**
 * Is plain object.
 *
 * @param input
 */
export function isPlainObject<T extends object = object>(
  input: unknown,
): input is T {
  return !(
    input === null ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    (input.constructor && input.constructor !== Object)
  );
}
