import folder from '../icons/folder.svg?raw';
import file from '../icons/file.svg?raw';
import chevron from '../icons/chevron.svg?raw';

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
export function getIcon(type: 'folder' | 'file' | 'chevron', content?: string): HTMLSpanElement {
  if (!['folder', 'file', 'chevron'].includes(type)) {
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
