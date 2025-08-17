import createFile from '@/Icons/create-file.svg?raw';
import createFolder from '@/Icons/create-folder.svg?raw';
import edit from '@/Icons/edit.svg?raw';
import removeFile from '@/Icons/remove-file.svg?raw';
import removeFolder from '@/Icons/remove-folder.svg?raw';
import { TreeJS } from '@/TreeJS';
import { deepMerge } from '@/utils/functions';
import type { ContextMenuOptions } from './@types';

// importing style
import './plugin.scss';
import { stringToHTMLElement } from '@/utils/dom';
import { TreeJSTypeError } from '@/utils/error';

/**
 * Context menu plugin
 * @param this
 * @param opts
 */
export default function (this: TreeJS, opts: ContextMenuOptions = {}) {
  const defaultOpts: ContextMenuOptions = {
    chooseFileId: false,
    chooseFileLabel: false,
    chooseFolderId: false,
    chooseFolderLabel: false,
  };
  opts = deepMerge<ContextMenuOptions>(opts, defaultOpts);

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
      const id = (e.target as HTMLElement).closest('li')?.getAttribute(`id`);

      if (!id) {
        throw new TreeJSTypeError('Required id is null or undefined');
      }

      if (isFile) {
        this._fileMenu(id);
      } else if (isFolder) {
        this._folderMenu(id);
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

  this._folderMenu = (id: string) => {
    contextMenu.innerHTML = `
      <button ${this._data_attribute}id="${id}" id="rename" class="${this._prefix}contextmenu-btn">${edit + this.t('rename')}</button>
      <button ${this._data_attribute}id="${id}" id="create-folder" class="${this._prefix}contextmenu-btn">${createFolder + this.t('create_folder')}</button>
      <button ${this._data_attribute}id="${id}" id="create-file" class="${this._prefix}contextmenu-btn">${createFile + this.t('create_file')}</button>
      <hr />
      <button ${this._data_attribute}id="${id}" id="remove-folder" class="${this._prefix}contextmenu-btn danger">${removeFolder + this.t('remove_folder')}</button>`;
  };

  this._fileMenu = (id: string) => {
    contextMenu.innerHTML = `
      <button ${this._data_attribute}id="${id}" id="rename" class="${this._prefix}contextmenu-btn">${edit + this.t('rename')}</button>
      <button ${this._data_attribute}id="${id}" id="create-folder" class="${this._prefix}contextmenu-btn">${createFolder + this.t('create_folder')}</button>
      <button ${this._data_attribute}id="${id}" id="create-file" class="${this._prefix}contextmenu-btn">${createFile + this.t('create_file')}</button>
      <hr />
      <button ${this._data_attribute}id="${id}" id="remove-file" class="${this._prefix}contextmenu-btn danger">${removeFile + this.t('remove_file')}</button>`;
  };

  this._bindContextMenuEvents = () => {
    contextMenu.querySelector('#create-folder')?.addEventListener('click', (event: Event) => {
      const pointerEvent = event as PointerEvent;
      const $button = pointerEvent.currentTarget as HTMLButtonElement;
      const id = $button.getAttribute(`${this._data_attribute}id`);
      const $parent = document.querySelector(`li[id="${id}"]`) as HTMLLIElement;
      if (id && $parent) {
        if (opts.chooseFolderLabel && !opts.chooseFolderId) {
          const label = prompt(this.t('choose_folder_label'), 'New folder');
          if (label === null) return; // User cancelled
          this.createFolder(label, $parent, id);
          return;
        }

        if (opts.chooseFolderId && !opts.chooseFolderLabel) {
          const label = prompt(this.t('choose_folder_id'), 'New folder');
          if (label === null) return; // User cancelled
          this.createFolder(label, $parent, id);
          return;
        }

        if (opts.chooseFolderLabel && opts.chooseFolderId) {
          const label = prompt(this.t('choose_folder_label'), 'New folder');
          if (label === null) return; // User cancelled
          const id = prompt(this.t('choose_folder_id'), 'New folder');
          if (id === null) return; // User cancelled
          this.createFolder(label, $parent, id);
          return;
        }

        this.createFolder('New folder', $parent);
        return;
      }

      throw new TreeJSTypeError('Required id is null or undefined or parent not found');
    });
    contextMenu.querySelector('#remove-folder')?.addEventListener('click', this._removeFolder);
    contextMenu.querySelector('#create-file')?.addEventListener('click', this._createFile);
    contextMenu.querySelector('#remove-file')?.addEventListener('click', this._removeFile);
    contextMenu.querySelector('#rename')?.addEventListener('click', (event: Event) => {
      const pointerEvent = event as PointerEvent;
      const $button = pointerEvent.currentTarget as HTMLButtonElement;
      const id = $button.getAttribute(`${this._data_attribute}id`);
      if (!id) {
        throw new TreeJSTypeError('Required id is null or undefined');
      }
      this.edit(id);
    });
  };

  this.createFolder = (label: string, parent?: HTMLLIElement, id?: string) => {
    if (!parent) {
      throw new TreeJSTypeError('Required parent is null or undefined');
    }
    const isFolder = parent.classList.contains('has-children');
    const $folder = stringToHTMLElement<HTMLLIElement>(
      `<li${id ? ` id="${id}" ` : ' '}class="${this._li_class}">${label}<ul></ul></li>`
    );

    if (!$folder) {
      throw new TreeJSTypeError('Failed to create folder element, check the HTML structure');
    }

    const $liList = $folder.parentElement?.querySelectorAll('li') as NodeListOf<HTMLLIElement>;

    this._buildList($liList, parent);

    if (isFolder) {
      const ul = parent.querySelector('ul');
      if (ul) {
        ul.appendChild($folder);
      }
    } else {
      parent.after($folder);
    }

    // Update the list of items
    this.$liList = this.$list.querySelectorAll('li') as NodeListOf<HTMLLIElement>;
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
