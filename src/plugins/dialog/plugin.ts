import { TreeJS } from '@/TreeJS';
import type { DialogOptions } from './@types';

import './plugin.scss';
import { stringToHTMLElement } from '@/utils/dom';
import { TreeJSError } from '@/utils/error';
import { createId } from '@/utils/functions';

/**
 * Dialog plugin for TreeJS
 * @name Dialog
 * @description Adds dialog functionality to the TreeJS instance.
 * @version 1.0.0
 * @author Your Name
 * @param {TreeJS} this - The TreeJS instance
 * @param {DialogOptions} options - Plugin options
 */
export default function (this: TreeJS, options: Partial<DialogOptions>) {
  // Default options
  const defaultOptions: DialogOptions = {
    position: 'center',
  };

  // Merge default options with user options
  options = { ...defaultOptions, ...options };
  this._dialogs = [];

  this.createDialog = (content: string, id?: string, autoOpen: boolean = true) => {
    if (!content) {
      throw new TreeJSError('Dialog content is required to create a dialog');
    }
    if (!id) {
      id = createId();
    }
    const $dialog = stringToHTMLElement<HTMLDialogElement>(
      `<dialog class="${this._prefix}dialog" id="${id}" ${autoOpen ? 'open' : ''}>${content}</dialog>`
    );

    this._dialogs.push($dialog);

    document.body.appendChild($dialog);
  };

  this.openDialog = (id: string) => {
    if (!id) {
      throw new TreeJSError('Dialog ID is required to open a dialog');
    }
    const $dialog = this._dialogs.find((dialog) => dialog.id === id);
    if ($dialog) {
      $dialog.showModal();
    }
  };

  this.closeDialog = (id: string) => {
    if (!id) {
      throw new TreeJSError('Dialog ID is required to close a dialog');
    }
    const $dialog = this._dialogs.find((dialog) => dialog.id === id);
    if ($dialog) {
      $dialog.close();
    }
  };

  function init(this: TreeJS) {
    // Your plugin code goes here
    console.log('Dialog plugin initialized with options:', options);

    this.off('initialize', binded);
  }

  const binded = init.bind(this);
  this.on('initialize', binded);

  // Return an object with plugin methods of others, or empty object if no methods
  return {
    createDialog: this.createDialog,
    openDialog: this.openDialog,
  };
}
