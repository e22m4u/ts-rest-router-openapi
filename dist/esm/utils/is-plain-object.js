/**
 * Is plain object.
 *
 * @param input
 */
export function isPlainObject(input) {
    return !(input === null ||
        typeof input !== 'object' ||
        Array.isArray(input) ||
        (input.constructor && input.constructor !== Object));
}
