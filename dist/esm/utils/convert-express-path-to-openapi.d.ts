/**
 * Конвертирует строки пути из синтаксиса Express.js
 * (например, /path/:param1/:param2)
 * в синтаксис OpenAPI
 * (например, /path/{param1}/{param2}).
 *
 * Поддерживаемые конструкции Express:
 * - :param -> {param}
 * - :param? -> {param} (знак '?' удаляется)
 * - :param(regex) -> {param} (регулярное выражение '(regex)' удаляется)
 * - :param(regex)? -> {param}
 *
 * НЕ преобразует:
 * - Wildcards типа '*' или '+' (например, '/files/*') - они остаются как есть.
 * - Анонимные параметры с regex (например, '/user/(\\d+)') - остаются как есть.
 *
 * @param expressPath Входная строка пути в формате Express.js.
 * @returns Строка пути, преобразованная в формат OpenAPI.
 */
export declare function convertExpressPathToOpenAPI(expressPath: string): string;
