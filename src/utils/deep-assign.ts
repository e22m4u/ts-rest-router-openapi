import {isPlainObject} from './is-plain-object.js';

/**
 * Глубоко объединяет объекты изменяя первый объект.
 *
 * Если в какой-то точке слияния типы несовместимы для глубокого слияния
 * (например, объект и число, или объект и массив), значение из `source`
 * перезаписывает значение в `target`.
 *
 * @param target Объект, в который будут слиты другие объекты.
 * @param sources Один или несколько объектов-источников.
 * @returns `target`
 */
export function deepAssign<T extends object>(
  target: T,
  ...sources: object[]
): T {
  if (!sources.length) {
    return target;
  }
  const source = sources.shift();
  if (isPlainObject(target) && isPlainObject(source)) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = (source as Record<string, unknown>)[key];
        const targetValue = (target as Record<string, unknown>)[key];
        if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
          deepAssign(targetValue as object, sourceValue as object);
        } else {
          (target as Record<string, unknown>)[key] = sourceValue;
        }
      }
    }
  } else {
    throw new Error('Arguments of deepAssign should be plain objects.');
  }
  if (sources.length > 0) {
    return deepAssign(target, ...sources);
  }
  return target;
}
