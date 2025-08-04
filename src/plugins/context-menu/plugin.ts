import createFile from '@/Icons/create-file.svg?raw';
import createFolder from '@/Icons/create-folder.svg?raw';
import removeFile from '@/Icons/remove-file.svg?raw';
import removeFolder from '@/Icons/remove-folder.svg?raw';
import { TreeJS } from '@/TreeJS';
import { deepMerge } from '@/utils/functions';
import type { myType } from './@types';

// importing style
import './plugin.scss';

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

  this._folderMenu = () => {
    contextMenu.innerHTML = `
      <button id="create-folder" class="${this._prefix}contextmenu-btn">${createFolder}</i>Create folder</button>
       <button id="create-file" class="${this._prefix}contextmenu-btn">${createFile}</i>Create file</button>
      <hr />
      <button id="remove-folder" class="${this._prefix}contextmenu-btn danger">${removeFolder}</i>Remove folder</button>`;
  };

  this._fileMenu = () => {
    contextMenu.innerHTML = `
      <button id="create-folder" class="${this._prefix}contextmenu-btn">${createFolder}</i>Create folder</button>
      <button id="create-file" class="${this._prefix}contextmenu-btn">${createFile}</i>Create file</button>

      <hr />
      <button id="remove-file" class="${this._prefix}contextmenu-btn danger">${removeFile}</i>Remove file</button>`;
  };

  this.on('initialize', () => {
    console.log(opts);

    const body = document.body;

    const closeContextMenu = (e: MouseEvent) => {
      if (e.target === contextMenu || !contextMenu.isConnected) return;
      body.removeChild(contextMenu);
    };

    const openContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      const isFile = !(e.target as HTMLElement).closest('li')?.classList.contains('has-children');
      const isFolder = (e.target as HTMLElement).closest('li')?.classList.contains('has-children');

      if (isFile) {
        this._fileMenu();
      } else if (isFolder) {
        this._folderMenu();
      }

      contextMenu.style.left = `${e.clientX}px`;
      contextMenu.style.top = `${e.clientY}px`;

      body.appendChild(contextMenu);
    };
    this.$liList.forEach(($li) => {
      $li.addEventListener('contextmenu', openContextMenu);
    });
    window.addEventListener('click', closeContextMenu);
  });

  return {
    options: opts,
  }
}
