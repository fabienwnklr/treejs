import './scss/style.scss';

import type { TreeJSOptions } from './@types';

import { TreeJSDefaultsOptions } from './constants';
import { deepMerge } from './utils/functions';
import { FileIcon, FolderIcon, createCheckbox } from './utils/dom';

export class TreeJS {
  $list: HTMLUListElement;
  options: TreeJSOptions;
  constructor($list: HTMLUListElement, options: Partial<TreeJSOptions>) {
    this.$list = $list;
    this.options = deepMerge<TreeJSOptions>(TreeJSDefaultsOptions, options);

    this.$list.classList.add('treejs-ul');
    this.$list.querySelectorAll('ul')?.forEach(($ul) => {
      $ul.classList.add('treejs-ul');
      if ($ul.querySelector('ul')) {
        $ul.classList.add('has-children');
      }
    });
    this.$list.querySelectorAll('li')?.forEach(($li, i) => {
      
      $li.classList.add('treejs-li');
      if ($li.querySelector('ul')) {
        $li.classList.add('has-children');
        $li.querySelector('ul')?.classList.add('hide');
        $li.querySelector('ul')?.classList.add('treejs-child');
        $li.prepend(FolderIcon());
      } else {
        $li.prepend(FileIcon());
      }

      if (this.options.checkbox) {
        const name = $li.dataset.treejsName || 'treejs-li-' + i
        $li.prepend(createCheckbox(name));
      }
    });
  }
}
