/**
 * @description Method to check if an item is an object. Date and Function are considered
 * an object, so if you need to exclude those, please update the method accordingly.
 * @param item - The item that needs to be checked
 * @return {Boolean} Whether or not @item is an object
 */
export function isObject(item: any): boolean {
  return item === Object(item) && !Array.isArray(item);
}

export function isTruthy(t: any): boolean {
  return typeof t !== 'undefined' && t !== '' && t !== null;
}

export function deepMerge<T extends object>(target: T, source: Partial<T> | T): T {
  if (!source) return target;
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key as keyof T])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key as keyof T] });
        } else {
          output[key as keyof object] = deepMerge(target[key as keyof object], source[key as keyof object]);
        }
      } else if (isTruthy(source[key as keyof T])) {
        Object.assign(output, { [key]: source[key as keyof T] });
      }
    });
  }
  return output;
}
/**
 * Sanitize a string by escaping special characters, replace spaces with underscores,
 * and trimming leading/trailing whitespace.
 * @param string - The string to be sanitized
 * @returns - The sanitized dtring string
 */
export function sanitizeString(string: string): string {
  return string
    .trim()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

export function _throwError(message: string) {
  new Error(`TreeJS Error: ${message}`);
}

export function _getLiName($li: HTMLLIElement, textNode?: Node | undefined | null): string {
  return $li.dataset.treejsName ? $li.dataset.treejsName : sanitizeString(textNode?.textContent || '');
}

export function isValidOptions(options: Record<string, any>, defaults: Record<string, any>): boolean {
  for (const key in options) {
    if (!(key in defaults)) {
      console.warn(`TreeJS : Unknown option: ${key}`);
      return false;
    }
  }
  return true;
}
