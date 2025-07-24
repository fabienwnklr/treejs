import type { TreeJSJSON } from '../@types';
import { TreeJSConsole } from './console';
import { TreeJSTypeError } from './error';

/**
 * please see [https://developer.mozilla.org/fr/docs/Web/API/Node/nodeName] for node name references
 * @param list
 * @param type
 * @returns {Node | undefined}
 */
export function findNodeByType(list: NodeList, type: string): Node | undefined {
  for (const node of list) {
    if (node.nodeName.toLowerCase() === type || node.nodeName === type) {
      return node;
    }
  }
}

export function createCheckbox(name: string): HTMLInputElement {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = name;
  checkbox.classList.add('treejs-checkbox');

  return checkbox;
}

export function stringToHTMLElement<T>(string: string): T {
  return new DOMParser().parseFromString(string, 'text/html').body.firstChild as T;
}

/**
 * Generate HTML list from TreeJSJSON object
 */
export function JSONToHTMLElement<T>(data: TreeJSJSON | Array<TreeJSJSON>): T {
  // Check json structure
  if (!data || (typeof data !== 'object' && !Array.isArray(data)))
    throw new TreeJSTypeError('JSONToHTMLElement: data must be an object or an array of objects');
  if (Array.isArray(data) && data.length === 0) {
    throw new TreeJSTypeError('JSONToHTMLElement: data cannot be an empty array');
  }

  // check json properties
  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (typeof item !== 'object' || !item.label) {
        throw new TreeJSTypeError('JSONToHTMLElement: each item in the array must be an object with a label property');
      }

      // if property is unknown, warning
      Object.keys(item).forEach((key) => {
        if (key !== 'label' && key !== 'children') {
          TreeJSConsole.warn(`JSONToHTMLElement: unknown property "${key}" in item`, item);
        }
      });
      // check children property
      if (item.children && !Array.isArray(item.children)) {
        throw new TreeJSTypeError('JSONToHTMLElement: children property must be an array');
      }

      if (item.children) {
        item.children.forEach((child) => {
          if (typeof child !== 'object' || !child.label) {
            throw new TreeJSTypeError('JSONToHTMLElement: each child must be an object with a label property');
          }

          // if property is unknown, warning
          Object.keys(child).forEach((key) => {
            if (key !== 'label' && key !== 'children') {
              TreeJSConsole.warn(`JSONToHTMLElement: unknown property "${key}" in child`, child);
            }
          });
        });
      }
    });
  } else {
    if (typeof data !== 'object' || !data.label) {
      throw new TreeJSTypeError('JSONToHTMLElement: the object must have a label property');
    }
  }

  // Render the JSON as an HTML list
  // This function is recursive to handle nested children
  function render(items: TreeJSJSON[]): string {
    return items
      .map(
        (item) =>
          `<li>${item.label}${
            item.children && item.children.length > 0 ? `<ul>${render(item.children)}</ul>` : ''
          }</li>`
      )
      .join('');
  }

  if (Array.isArray(data)) {
    return stringToHTMLElement(render(data));
  } else {
    // data est un objet simple, on l'encapsule dans un tableau pour réutiliser render
    return stringToHTMLElement(render([data]));
  }
}

export function getHiddenElementHeight(element: HTMLElement): number {
  // Sauvegarde les styles actuels
  const originalDisplay = element.style.display;
  const originalVisibility = element.style.visibility;
  const originalPosition = element.style.position;
  const originalHeight = element.style.height;

  // Rends l'élément mesurable mais invisible à l'utilisateur
  element.style.display = 'block';
  element.style.visibility = 'hidden';
  element.style.position = 'absolute';
  element.style.height = 'auto'; // Assure que la hauteur est calculée correctement

  // Mesure la hauteur
  const height = element.scrollHeight;

  // Restaure les styles
  element.style.display = originalDisplay;
  element.style.visibility = originalVisibility;
  element.style.position = originalPosition;
  element.style.height = originalHeight;

  return height;
}

export function skeletonLoader(): HTMLDivElement {
  return stringToHTMLElement<HTMLDivElement>('<div class="treejs-skeleton-box"></div>');
}
