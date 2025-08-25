import { TreeJS } from '@/TreeJS';
import type { DialogOptions } from './@types';

import './plugin.scss';

/**
 * Dialog plugin for TreeJS
 * @name Dialog
 * @description Adds dialog functionality to the TreeJS instance.
 * @version 1.0.0
 * @author Your Name
 * @param {TreeJS} this - The TreeJS instance
 * @param {DialogOptions} options - Plugin options
 */
export default function (this: TreeJS, options: DialogOptions) {
  // Default options
  const defaultOptions: DialogOptions = {
    // Define default options here
  };

  // Merge default options with user options
  const mergedOptions = { ...defaultOptions, ...options };

  function init(this: TreeJS) {
    // Your plugin code goes here
    console.log('Dialog plugin initialized with options:', mergedOptions);

    this.off('initialize', binded);
  }

  const binded = init.bind(this);
  this.on('initialize', binded);

  // Return an object with plugin methods of others, or empty object if no methods
  return {};
}
