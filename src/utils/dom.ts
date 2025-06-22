import type { TreeJSJSON } from '../@types';

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
