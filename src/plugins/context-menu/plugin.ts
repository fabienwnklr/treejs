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

  this.on('initialize', () => {
    console.log(opts);

    const body = document.body;

    const contextMenu = document.createElement('div');
    contextMenu.classList.add(`${this._prefix}contextmenu`);

    contextMenu.innerHTML = `
      <button id="create-folder">${createFolder}</i>Create folder</button>
      <button id="create-file">${createFile}</i>Create file</button>
      <hr />
      <button id="remove-file">${removeFile}</i>Remove file</button>
      <button id="remove-folder">${removeFolder}</i>Remove folder</button>`;

    const closeContextMenu = (e: MouseEvent) => {
      if (e.target === contextMenu || !contextMenu.isConnected) return;
      body.removeChild(contextMenu);
    };

    const openContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      const isFile = !(e.target as HTMLElement).closest('li')?.classList.contains('has-children');
      const isFolder = (e.target as HTMLElement).closest('li')?.classList.contains('has-children');

      console.log('isFile:', isFile, 'isFolder:', isFolder);

      contextMenu.style.left = `${e.clientX}px`;
      contextMenu.style.top = `${e.clientY}px`;

      body.appendChild(contextMenu);
    };
    this.$liList.forEach(($li) => {
      $li.addEventListener('contextmenu', openContextMenu);
    });
    window.addEventListener('click', closeContextMenu);
  });
}
