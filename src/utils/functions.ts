import { findNodeByType } from './dom';

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
    .replace(/\./g, '_') // replace dots with underscores
    .replace(/[^\w\s]/gi, '') // remove special characters except alphanumeric, underscores and spaces
    .replace(/\s+/g, '_') // replace spaces with underscores
    .toLowerCase();
}

export function _getLiName($li: HTMLLIElement, textNode?: Node | undefined | null): string {
  return $li.dataset.treejsName ? $li.dataset.treejsName : sanitizeString(textNode?.textContent || '');
}

export function createId($li?: HTMLLIElement): string {
  const id =
    sanitizeString($li?.firstChild?.textContent?.trim() || Math.random().toString(36).slice(2, 9)) +
    '-' +
    Math.random().toString(36).slice(2, 9);
  $li?.setAttribute('id', id);
  return id;
}

/**
 * Check if options object is valid from default options
 * @param options
 * @param defaults
 * @returns {boolean}
 */
export function isValidOptions(options: Record<string, any>, defaults: Record<string, any>): boolean {
  for (const key in options) {
    if (!(key in defaults)) {
      console.warn(`TreeJS : Unknown option: ${key}`);
      return false;
    }
  }
  return true;
}

/**
 * Get all data attributes from an element with specific prefix
 * @param data_prefix Data prefix to look for, at format 'data-'
 * @param $el
 * @returns {Record<string, any>}
 */
export function getAttributes(data_prefix: string, $el: HTMLElement): Record<string, any> {
  const attributes: Record<string, any> = {};
  data_prefix.endsWith('-') ? (data_prefix += '') : (data_prefix += '-');
  for (const attr of $el.attributes) {
    if (attr.name.startsWith(data_prefix)) {
      const key = attr.name.replace(data_prefix, '');
      attributes[key] = attr.value;
    }
  }
  return attributes;
}

/**
 * Check if attributes are valid
 * @param attributes Attributes to validate
 * @param attributesList List of valid attributes with their names, types and descriptions
 * @returns {boolean}
 */
export function validateAttributes(
  attributes: Record<string, any> = {},
  attributesList: { name: string; type: string; description: string }[] = []
): boolean {
  const validNames = new Set(attributesList.map((attr: any) => attr.name));
  const isValid =
    Object.keys(attributes).filter((key) => validNames.has(key)).length === Object.keys(attributes).length;

  if (!isValid) {
    console.warn(
      'TreeJS : Invalid attributes found. Valid attributes are:',
      validNames,
      'but found:',
      Object.keys(attributes)
    );
    return false;
  }
  return true;
}

/**
 * Bind all methods of a class instance to the instance itself.
 * This is useful to ensure that methods can be called with the correct context,
 * especially when passing methods as callbacks.
 * This function iterates over all properties of the instance's prototype,
 * checks if they are functions, and binds them to the instance.
 * @template T Type of the class instance
 * @param instance Instance of a class to bind all methods to
 */
export function bindAllMethods<T extends object>(instance: T): void {
  const proto = Object.getPrototypeOf(instance);

  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key === 'constructor') continue; // on ignore le constructeur

    const value = (instance as any)[key];
    if (typeof value === 'function') {
      (instance as any)[key] = value.bind(instance);
    }
  }
}

/**
 * This function recursively collects all <li> elements that have a child <ul>
 * and adds them to the provided Set.
 * It starts from the root element and traverses through all child <ul> elements.
 *
 * @param root Root element to start collecting children from
 * @param toOpen Set to collect all <li> elements that have a child <ul>
 */
export function collectFolderChildren(root: HTMLElement, toOpen: Set<HTMLLIElement>) {
  const liWithUl = root.querySelectorAll('li:has(> ul)') as NodeListOf<HTMLLIElement>;

  liWithUl.forEach((li) => {
    toOpen.add(li);

    // recursive call
    const ul = li.querySelector(':scope > ul');
    if (ul) {
      collectFolderChildren(ul as HTMLElement, toOpen);
    }
  });
}
