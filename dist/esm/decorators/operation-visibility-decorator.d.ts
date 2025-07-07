import { Prototype } from '../types.js';
/**
 * Decorator @oaOperationVisibility.
 *
 * @param visible
 */
export declare function oaOperationVisibility<T extends object>(visible: boolean): (target: Prototype<T>, propertyKey: string, descriptor: PropertyDescriptor) => void;
/**
 * Decorator @oaHiddenOperation (alias).
 */
export declare function oaHiddenOperation(): (target: Prototype<object>, propertyKey: string, descriptor: PropertyDescriptor) => void;
/**
 * Decorator @oaVisibleOperation (alias).
 */
export declare function oaVisibleOperation(): (target: Prototype<object>, propertyKey: string, descriptor: PropertyDescriptor) => void;
