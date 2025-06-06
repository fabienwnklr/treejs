import { TreeJS } from '../../TreeJS';
// import { ... } from '../../utils/dom'
import { deepMerge } from '../../utils/functions';
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

  const createfolderIcon = `<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13V9a2 2 0 0 0-2-2h-5.93a2 2 0 0 1-1.664-.89l-.812-1.22A2 2 0 0 0 8.93 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7m6-5v3m0 3v-3m0 0h-3m3 0h3"/>
</svg>`;
  const createfileIcon = `<svg width="18" height="18" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2.5 5.5v-4a1 1 0 0 1 1-1h5l5 5v7a1 1 0 0 1-1 1h-5"/>
      <path d="M8.5.5v5h5m-10 2v6m-3-3h6"/>
  </g>
</svg>`;
  const removefileIcon = `<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <g fill="none">
      <path stroke="#000000" stroke-width="1.5" d="M13 2.5V5c0 2.357 0 3.536.732 4.268C14.464 10 15.643 10 18 10h4"/>
      <path stroke="#000000" stroke-linecap="round" stroke-width="1.5" d="m6 18l3-3m0 3l-3-3"/>
      <path fill="#000000" d="M2.75 10a.75.75 0 0 0-1.5 0h1.5Zm18.5 4a.75.75 0 0 0 1.5 0h-1.5Zm-5.857-9.946l-.502.557l.502-.557Zm3.959 3.563l-.502.557l.502-.557Zm2.302 2.537l-.685.305l.685-.305ZM3.172 20.828l.53-.53l-.53.53Zm17.656 0l-.53-.53l.53.53ZM1.355 5.927a.75.75 0 0 0 1.493.146l-1.493-.146Zm21.29 12.146a.75.75 0 1 0-1.493-.146l1.493.146ZM14 21.25h-4v1.5h4v-1.5ZM2.75 14v-4h-1.5v4h1.5Zm18.5-.437V14h1.5v-.437h-1.5ZM14.891 4.61l3.959 3.563l1.003-1.115l-3.958-3.563l-1.004 1.115Zm7.859 8.952c0-1.689.015-2.758-.41-3.714l-1.371.61c.266.598.281 1.283.281 3.104h1.5Zm-3.9-5.389c1.353 1.218 1.853 1.688 2.119 2.285l1.37-.61c-.426-.957-1.23-1.66-2.486-2.79L18.85 8.174ZM10.03 2.75c1.582 0 2.179.012 2.71.216l.538-1.4c-.852-.328-1.78-.316-3.248-.316v1.5Zm5.865.746c-1.086-.977-1.765-1.604-2.617-1.93l-.537 1.4c.532.204.98.592 2.15 1.645l1.004-1.115ZM10 21.25c-1.907 0-3.261-.002-4.29-.14c-1.005-.135-1.585-.389-2.008-.812l-1.06 1.06c.748.75 1.697 1.081 2.869 1.239c1.15.155 2.625.153 4.489.153v-1.5ZM1.25 14c0 1.864-.002 3.338.153 4.489c.158 1.172.49 2.121 1.238 2.87l1.06-1.06c-.422-.424-.676-1.004-.811-2.01c-.138-1.027-.14-2.382-.14-4.289h-1.5ZM14 22.75c1.864 0 3.338.002 4.489-.153c1.172-.158 2.121-.49 2.87-1.238l-1.06-1.06c-.424.422-1.004.676-2.01.811c-1.027.138-2.382.14-4.289.14v1.5Zm-3.97-21.5c-1.875 0-3.356-.002-4.511.153c-1.177.158-2.129.49-2.878 1.238l1.06 1.06c.424-.422 1.005-.676 2.017-.811c1.033-.138 2.395-.14 4.312-.14v-1.5ZM2.848 6.073c.121-1.234.382-1.9.854-2.371l-1.06-1.06c-.836.834-1.153 1.919-1.287 3.285l1.493.146Zm18.304 11.854c-.121 1.234-.383 1.9-.854 2.371l1.06 1.06c.836-.834 1.153-1.919 1.287-3.285l-1.493-.146Z"/>
  </g>
</svg>`;
  const removefolderIcon = `<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="none" stroke="#000000" stroke-linecap="round" stroke-width="1.5" d="M14 14h-4m12-2.202c0-2.632 0-3.949-.77-4.804a2.984 2.984 0 0 0-.224-.225C20.151 6 18.834 6 16.202 6h-.374c-1.153 0-1.73 0-2.268-.153a4 4 0 0 1-.848-.352C12.224 5.224 11.816 4.815 11 4l-.55-.55c-.274-.274-.41-.41-.554-.53a4 4 0 0 0-2.18-.903C7.53 2 7.336 2 6.95 2c-.883 0-1.324 0-1.692.07A4 4 0 0 0 2.07 5.257C2 5.626 2 6.068 2 6.95M21.991 16c-.036 2.48-.22 3.885-1.163 4.828C19.657 22 17.771 22 14 22h-4c-3.771 0-5.657 0-6.828-1.172C2 19.657 2 17.771 2 14v-3"/>
</svg>`;

  this.on('init', () => {
    // write your plugin ...
    console.log(opts);

    const body = document.body;

    const contextMenu = document.createElement('div');
    contextMenu.classList.add('treejs-contextmenu');

    contextMenu.innerHTML = `
<button>${createfolderIcon}</i>Create folder</button>
<button>${createfileIcon}</i>Create file</button>
<hr />
<button>${removefileIcon}</i>Remove file</button>
<button>${removefolderIcon}</i>Remove folder</button>`;
    const closeContextMenu = (e: MouseEvent) => {
      if (e.target === contextMenu || !contextMenu.isConnected) return;
      body.removeChild(contextMenu);
    };

    const openContextMenu = (e: MouseEvent) => {
      e.preventDefault();

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
