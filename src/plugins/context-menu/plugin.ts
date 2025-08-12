import createFile from '@/Icons/create-file.svg?raw';
import createFolder from '@/Icons/create-folder.svg?raw';
import edit from '@/Icons/edit.svg?raw';
import removeFile from '@/Icons/remove-file.svg?raw';
import removeFolder from '@/Icons/remove-folder.svg?raw';
import { TreeJS } from '@/TreeJS';
import { deepMerge } from '@/utils/functions';
import type { myType } from './@types';

// importing style
import './plugin.scss';
import { createLiElement } from '@/utils/dom';
import { TreeJSTypeError } from '@/utils/error';

/**
 * Context menu plugin
 * @param this
 * @param opts
 */
export default function (this: TreeJS, opts: myType = {}) {
  const defaultOpts: myType = { prop1: '' };
  opts = deepMerge<myType>(opts, defaultOpts);

  const contextMenu = document.createElement('div');
  contextMenu.classList.add(`${this._prefix}contextmenu`);

  function init(this: TreeJS) {
    const body = document.body;

    const closeContextMenu = (e: MouseEvent) => {
      if (e.target === contextMenu || !contextMenu.isConnected) return;
      body.removeChild(contextMenu);
    };

    const openContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      const isFile = !(e.target as HTMLElement).closest('li')?.classList.contains('has-children');
      const isFolder = (e.target as HTMLElement).closest('li')?.classList.contains('has-children');
      const name = (e.target as HTMLElement).closest('li')?.getAttribute(`${this._data_attribute}name`);

      if (!name) {
        throw new TreeJSTypeError('Required name is null or undefined');
      }

      if (isFile) {
        this._fileMenu(name);
      } else if (isFolder) {
        this._folderMenu(name);
      }

      contextMenu.style.left = `${e.clientX}px`;
      contextMenu.style.top = `${e.clientY}px`;

      body.appendChild(contextMenu);
      this._bindContextMenuEvents();
    };
    this.$list.addEventListener('contextmenu', openContextMenu);
    window.addEventListener('click', closeContextMenu);
    this.off('initialize', binded);
  }

  const binded = init.bind(this);
  this.on('initialize', binded);

  this._folderMenu = (name: string) => {
    contextMenu.innerHTML = `
      <button ${this._data_attribute}name="${name}" id="rename" class="${this._prefix}contextmenu-btn">${edit + this.t('rename')}</button>
      <button ${this._data_attribute}name="${name}" id="create-folder" class="${this._prefix}contextmenu-btn">${createFolder + this.t('create_folder')}</button>
      <button ${this._data_attribute}name="${name}" id="create-file" class="${this._prefix}contextmenu-btn">${createFile + this.t('create_file')}</button>
      <hr />
      <button ${this._data_attribute}name="${name}" id="remove-folder" class="${this._prefix}contextmenu-btn danger">${removeFolder + this.t('remove_folder')}</button>`;
  };

  this._fileMenu = (name: string) => {
    contextMenu.innerHTML = `
      <button ${this._data_attribute}name="${name}" id="rename" class="${this._prefix}contextmenu-btn">${edit + this.t('rename')}</button>
      <button ${this._data_attribute}name="${name}" id="create-folder" class="${this._prefix}contextmenu-btn">${createFolder + this.t('create_folder')}</button>
      <button ${this._data_attribute}name="${name}" id="create-file" class="${this._prefix}contextmenu-btn">${createFile + this.t('create_file')}</button>
      <hr />
      <button ${this._data_attribute}name="${name}" id="remove-file" class="${this._prefix}contextmenu-btn danger">${removeFile}${this.t('remove_file')}</button>`;
  };

  this._bindContextMenuEvents = () => {
    contextMenu.querySelector('#create-folder')?.addEventListener('click', (event: Event) => {
      const pointerEvent = event as PointerEvent;
      const $button = pointerEvent.currentTarget as HTMLButtonElement;
      const name = $button.getAttribute(`${this._data_attribute}name`);
      const $parent = document.querySelector(`li[${this._data_attribute}name="${name}"]`) as HTMLLIElement;
      if (name && $parent) {
        this.createFolder('New folder', '', $parent);
        return;
      }

      throw new TreeJSTypeError('Required name is null or undefined or parent not found');
    });
    contextMenu.querySelector('#remove-folder')?.addEventListener('click', this._removeFolder);
    contextMenu.querySelector('#create-file')?.addEventListener('click', this._createFile);
    contextMenu.querySelector('#remove-file')?.addEventListener('click', this._removeFile);
    contextMenu.querySelector('#rename')?.addEventListener('click', (event: Event) => {
      const pointerEvent = event as PointerEvent;
      const $button = pointerEvent.currentTarget as HTMLButtonElement;
      const name = $button.getAttribute(`${this._data_attribute}name`);
      if (!name) {
        throw new TreeJSTypeError('Required name is null or undefined');
      }
      this.edit(name);
    });
  };

  this.createFolder = (label: string, name?: string, parent?: HTMLLIElement) => {
    if (!parent) {
      throw new TreeJSTypeError('Required parent is null or undefined');
    }
    const isFolder = parent.classList.contains('has-children');
    const $folder = createLiElement(this._li_class, true, this._anchor_class, label, name);

    if (isFolder) {
      const ul = parent.querySelector('ul');
      if (ul) {
        ul.appendChild($folder);
      }
    } else {
      parent.after($folder);
    }

    // then bind event to the new folder
    this._bindEvents();
  };

  // this._removeFolder = (event: Event) => {
  //   const pointerEvent = event as PointerEvent;
  //   TreeJSConsole.log('remove folder', pointerEvent);
  // };

  // this._createFile = (event: Event) => {
  //   const pointerEvent = event as PointerEvent;
  //   TreeJSConsole.log('create file', pointerEvent);
  // };

  // this._removeFile = (event: Event) => {
  //   const pointerEvent = event as PointerEvent;
  //   TreeJSConsole.log('remove file', pointerEvent);
  // };

  return {
    options: opts,
  };
}
