/**
 * Clone deep.
 *
 * @param value
 */
export function cloneDeep<T extends object>(value: T) {
  return JSON.parse(JSON.stringify(value));
}
