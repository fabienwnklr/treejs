import { TreeJS } from '@/TreeJS';
import type { DialogOptions, UniqueDialogOptions } from './@types';

import './plugin.scss';
import IconClose from '@/icons/close.svg?raw';
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

  this.createDialog = (content: string, dialogOptions: Partial<UniqueDialogOptions>) => {
    if (!content) {
      throw new TreeJSError('Dialog content is required to create a dialog');
    }

    const defaultDialogOptions = { autoOpen: true, footer: false as false, id: createId(), title: false as false };
    dialogOptions = { ...defaultDialogOptions, ...dialogOptions };
    let { id, autoOpen, title, footer } = dialogOptions;
    if (!id) {
      id = createId();
    }

    // Check if dialog with id exists
    const existingDialog = this._dialogs.find((dialog) => dialog.id === id);
    if (existingDialog) {
      // Dialog with id already exists, open it
      existingDialog.showModal();
      return existingDialog;
    }

    const $dialog = stringToHTMLElement<HTMLDialogElement>(
      `<dialog class="${this._prefix}dialog" id="${id}">
        <div class="${this._prefix}dialog-header">
          ${title ? `<h1 class="${this._prefix}dialog-title">${title}</h1>` : ''}
          <button class="${this._prefix}dialog-close" label="${this.t('close')}">
            ${IconClose}
          </button>
        </div>
        <div class="${this._prefix}dialog-content">
          ${content}
        </div>
        ${footer ? `<div class="${this._prefix}dialog-footer">${footer}</div>` : ''}
      </dialog>`
    );

    this._dialogs.push($dialog);

    document.body.appendChild($dialog);

    $dialog.querySelector(`.${this._prefix}dialog-close`)?.addEventListener('click', () => {
      $dialog.close();
    });

    if (autoOpen) {
      $dialog.showModal();

      this.trigger('dialog-open', { $dialog, id });
    }

    return $dialog;
  };

  this.openDialog = (id: string) => {
    if (!id) {
      throw new TreeJSError('Dialog ID is required to open a dialog');
    }
    const $dialog = this._dialogs.find((dialog) => dialog.id === id);
    if ($dialog) {
      $dialog.showModal();

      this.trigger('dialog-open', { $dialog, id });
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
