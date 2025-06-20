import folder from '../icons/folder.svg?raw';
import file from '../icons/file.svg?raw';
import chevron from '../icons/chevron.svg?raw';
import { sanitizeString } from './functions';
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
 * Get html with icon svg
 * @param type 'folder' | 'file' | 'chevron'
 * @param content svg string
 * @returns
 */
export function getIcon(type: 'folder' | 'file' | 'chevron' | 'loader', content?: string): HTMLSpanElement {
  if (!['folder', 'file', 'chevron', 'loader'].includes(type)) {
    throw new Error(`Invalid icon type: ${type}. Expected 'folder', 'file', or 'chevron'.`);
  }

  let icon: string;
  if (type && (!content || typeof content !== 'string')) {
    switch (type) {
      case 'folder':
        icon = folder;
        break;
      case 'file':
        icon = file;
        break;
      case 'chevron':
        icon = chevron;
        break;
      case 'loader':
        icon = `<div class="treejs-loader">
            <span class="treejs-loader-icon"></span>
          </div>`;
        break;
      default:
        throw new Error(`Unknown icon type: ${type}`);
    }
  } else if (content && typeof content === 'string') {
    icon = content;
  } else {
    throw new Error(`Invalid content for icon type: ${type}. Expected a string.`);
  }

  return stringToHTMLElement<HTMLSpanElement>(`<span class="treejs-icon treejs-icon-${type}">${icon}</span>`);
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

export function _createAnchorWrapper(text: string): HTMLSpanElement {
  return stringToHTMLElement<HTMLSpanElement>(
    `<span class="treejs-anchor-wrapper">
      <a class="treejs-anchor">${text}</a>
    </span>`
  );
}
