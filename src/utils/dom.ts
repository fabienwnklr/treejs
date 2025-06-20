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

/**
 * Generate HTML list from TreeJSJSON object
 */
export function JSONToHTML(
  json: TreeJSJSON | Array<TreeJSJSON>,
  path: boolean = true
): HTMLLIElement | DocumentFragment {
  if (Array.isArray(json)) {
    const fragment = document.createDocumentFragment();
    for (const item of json) {
      const li = JSONToHTML(item, path) as HTMLLIElement;
      fragment.appendChild(li);
    }
    return fragment;
  }

  const label = json.label || '';
  const safeLabel = sanitizeString(label);

  const $li = document.createElement('li');
  $li.classList.add('treejs-li');
  $li.setAttribute('data-treejs-name', safeLabel);

  const $wrapper = document.createElement('span');
  $wrapper.classList.add('treejs-anchor-wrapper');

  const $anchor = document.createElement('a');
  $anchor.classList.add('treejs-anchor');
  $anchor.href = '#';
  $anchor.textContent = label;

  $wrapper.appendChild($anchor);

  if (json.children?.length) {
    $wrapper.prepend(getIcon('folder'));
    $wrapper.append(getIcon('chevron'));

    const $ul = document.createElement('ul');
    $ul.classList.add('treejs-ul', 'treejs-child');
    if (path) $ul.classList.add('path');

    for (const child of json.children) {
      const childLi = JSONToHTML(child, path) as HTMLLIElement;
      $ul.appendChild(childLi);
    }

    $li.appendChild($wrapper);
    $li.appendChild($ul);
    $li.classList.add('has-children', 'hide');
  } else {
    $wrapper.prepend(getIcon('file'));
    $li.appendChild($wrapper);
  }

  return $li;
}

export function _createAnchorWrapper(text: string): HTMLSpanElement {
  return stringToHTMLElement<HTMLSpanElement>(
    `<span class="treejs-anchor-wrapper">
      <a class="treejs-anchor" href="#">${text}</a>
    </span>`
  );
}