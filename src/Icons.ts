import chevron from './icons/chevron.svg?raw';
import file from './icons/file.svg?raw';
import folder from './icons/folder.svg?raw';
import folderOpen from './icons/folder-open.svg?raw';
import { stringToHTMLElement } from './utils/dom';
import { TreeJSError } from './utils/error';
export class Icons {
  static _prefix = '';
  static _icon_class = '';
  static iconsTypes: string[] = ['folder', 'file', 'chevron', 'loader', 'folderOpen'];

  static get(type: 'folder' | 'file' | 'chevron' | 'loader' | 'folderOpen', content?: string): HTMLSpanElement {
    // check if type is valid
    if (!Icons.iconsTypes.includes(type)) {
      throw new TreeJSError(`Invalid icon type: ${type}. Expected 'folder', 'file', 'chevron', or 'loader'.`);
    }

    if (content) {
      // If content is provided, replace the innerHTML of the icon
      const iconElement = stringToHTMLElement<HTMLSpanElement>(content);
      return iconElement;
    }
    return Icons[type]();
  }

  static folder(): HTMLSpanElement {
    return stringToHTMLElement<HTMLSpanElement>(`<span class="${this._icon_class}">${folder}</span>${folder}</span>`);
  }

  static folderOpen(): HTMLSpanElement {
    return stringToHTMLElement<HTMLSpanElement>(`<span class="${this._icon_class}">${folderOpen}</span>`);
  }

  static file(): HTMLSpanElement {
    return stringToHTMLElement<HTMLSpanElement>(`<span class="${this._icon_class}">${file}</span>`);
  }

  static chevron(): HTMLSpanElement {
    return stringToHTMLElement<HTMLSpanElement>(`<span class="${this._icon_class}-chevron">${chevron}</span>`);
  }

  static loader(): HTMLSpanElement {
    return stringToHTMLElement<HTMLSpanElement>(`<div class="${this._prefix}loader">
            <span class="${this._prefix}loader-icon"></span>
          </div>`);
  }
}
