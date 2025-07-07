import {Prototype} from '../types.js';
import {Constructor} from '../types.js';
import {DecoratorTargetType} from '@e22m4u/ts-reflector';
import {getDecoratorTargetType} from '@e22m4u/ts-reflector';
import {OAVisibilityReflector} from './visibility-reflector.js';

/**
 * Decorator @oaVisibility.
 *
 * @param visible
 */
export function oaVisibility<T extends object>(visible: boolean) {
  return function (
    target: Constructor<T> | Prototype<T>,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) {
    const decoratorType = getDecoratorTargetType(
      target,
      propertyKey,
      descriptor,
    );
    if (
      decoratorType !== DecoratorTargetType.CONSTRUCTOR &&
      decoratorType !== DecoratorTargetType.INSTANCE_METHOD
    ) {
      throw new Error(
        '@oaVisibility decorator is only supported ' +
          'on a class or an instance method.',
      );
    }
    OAVisibilityReflector.setMetadata(
      {method: propertyKey, visible},
      typeof target === 'function'
        ? target
        : (target.constructor as Constructor<T>),
      propertyKey,
    );
  };
}

/**
 * Decorator @oaHidden (alias).
 */
export function oaHidden() {
  return oaVisibility(false);
}

/**
 * Decorator @oaVisible (alias).
 */
export function oaVisible() {
  return oaVisibility(true);
}
