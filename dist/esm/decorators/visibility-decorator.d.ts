import { Prototype } from '../types.js';
import { Constructor } from '../types.js';
/**
 * Decorator @oaVisibility.
 *
 * @param visible
 */
export declare function oaVisibility<T extends object>(visible: boolean): (target: Constructor<T> | Prototype<T>, propertyKey?: string, descriptor?: PropertyDescriptor) => void;
/**
 * Decorator @oaHidden (alias).
 */
export declare function oaHidden(): (target: Constructor<object> | Prototype<object>, propertyKey?: string, descriptor?: PropertyDescriptor) => void;
/**
 * Decorator @oaVisible (alias).
 */
export declare function oaVisible(): (target: Constructor<object> | Prototype<object>, propertyKey?: string, descriptor?: PropertyDescriptor) => void;
