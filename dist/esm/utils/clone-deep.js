/**
 * Clone deep.
 *
 * @param value
 */
export function cloneDeep(value) {
    return JSON.parse(JSON.stringify(value));
}
