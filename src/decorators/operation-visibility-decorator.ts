import {Prototype} from '../types.js';
import {Constructor} from '../types.js';
import {DecoratorTargetType} from '@e22m4u/ts-reflector';
import {getDecoratorTargetType} from '@e22m4u/ts-reflector';
import {OAOperationVisibilityReflector} from './operation-visibility-reflector.js';

/**
 * Decorator @oaOperationVisibility.
 *
 * @param visible
 */
export function oaOperationVisibility<T extends object>(visible: boolean) {
  return function (
    target: Prototype<T>,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const decoratorType = getDecoratorTargetType(
      target,
      propertyKey,
      descriptor,
    );
    if (decoratorType !== DecoratorTargetType.INSTANCE_METHOD)
      throw new Error(
        '@oaOperationVisibility decorator is only supported on an instance method.',
      );
    OAOperationVisibilityReflector.setMetadata(
      {method: propertyKey, visible},
      target.constructor as Constructor<T>,
      propertyKey,
    );
  };
}

/**
 * Decorator @oaHiddenOperation (alias).
 */
export function oaHiddenOperation() {
  return oaOperationVisibility(false);
}

/**
 * Decorator @oaVisibleOperation (alias).
 */
export function oaVisibleOperation() {
  return oaOperationVisibility(true);
}
