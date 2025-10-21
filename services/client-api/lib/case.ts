// Simple case conversion utilities for API payloads

const toSnakeString = (s: string): string =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();

const toCamelString = (s: string): string =>
  s.replace(/[_-](\w)/g, (_, c: string) => (c ? c.toUpperCase() : ''));

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  Object.prototype.toString.call(v) === '[object Object]';

const mapKeysDeep = (input: any, keyMapper: (key: string) => string): any => {
  if (Array.isArray(input)) {
    return input.map((v) => mapKeysDeep(v, keyMapper));
  }
  if (isPlainObject(input)) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      out[keyMapper(k)] = mapKeysDeep(v, keyMapper);
    }
    return out;
  }
  return input;
};

export const toSnake = <T = any>(input: T): T =>
  mapKeysDeep(input, toSnakeString);

export const toCamel = <T = any>(input: T): T =>
  mapKeysDeep(input, toCamelString);
