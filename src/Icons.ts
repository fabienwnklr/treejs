import { stringToHTMLElement } from '@utils/dom';
import { TreeJSError } from '@utils/error';
import chevron from '@/Icons/chevron.svg?raw';
import createFile from '@/Icons/create-file.svg?raw';
import createfolder from '@/Icons/create-folder.svg?raw';
import edit from '@/Icons/edit.svg?raw';
import file from '@/Icons/file.svg?raw';
import folder from '@/Icons/folder.svg?raw';
import folderOpen from '@/Icons/folder-open.svg?raw';
import removeFile from '@/Icons/remove-file.svg?raw';
import removefolder from '@/Icons/remove-folder.svg?raw';
import type { IconType } from './@types/icon';
export class Icons {
  static _prefix = '';
  static _icon_class = '';
  static iconsTypes: IconType[] = [
    'folder',
    'file',
    'chevron',
    'loader',
    'folderOpen',
    'createFolder',
    'removeFile',
    'removeFolder',
    'createFile',
    'edit',
  ];

  static get(type: IconType, content?: string): HTMLSpanElement {
    // check if type is valid
    if (!Icons.iconsTypes.includes(type)) {
      throw new TreeJSError(`Invalid icon type: ${type}. Expected ${Icons.iconsTypes.join(', ')}.`);
    }

    if (content) {
      // If content is provided, replace the innerHTML of the icon
      const iconElement = stringToHTMLElement<HTMLSpanElement>(`<span class="${this._icon_class}">${content}</span>`);
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

  static createFolder(): HTMLSpanElement {
    return stringToHTMLElement<HTMLSpanElement>(`<span class="${this._icon_class}">${createfolder}</span>`);
  }

  static removeFile(): HTMLSpanElement {
    return stringToHTMLElement<HTMLSpanElement>(`<span class="${this._icon_class}">${removeFile}</span>`);
  }

  static removeFolder(): HTMLSpanElement {
    return stringToHTMLElement<HTMLSpanElement>(`<span class="${this._icon_class}">${removefolder}</span>`);
  }

  static createFile(): HTMLSpanElement {
    return stringToHTMLElement<HTMLSpanElement>(`<span class="${this._icon_class}">${createFile}</span>`);
  }

  static edit(): HTMLSpanElement {
    return stringToHTMLElement<HTMLSpanElement>(`<span class="${this._icon_class}">${edit}</span>`);
  }
}
