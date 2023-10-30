import './scss/style.scss';

import type { TreeJSOptions } from './@types';

import { TreeJSDefaultsOptions } from './constants';
import { deepMerge } from './utils/functions';
import { ChevronIcon, FileIcon, FolderIcon, createCheckbox } from './utils/dom';

export class TreeJS {
  $list: HTMLUListElement;
  options: TreeJSOptions;
  constructor($list: HTMLUListElement, options: Partial<TreeJSOptions>) {
    this.$list = $list;
    this.options = deepMerge<TreeJSOptions>(TreeJSDefaultsOptions, options);

    this.$list.classList.add('treejs');
    this.$list.querySelectorAll('ul')?.forEach(($ul) => {
      const classes = ['treejs-ul'];

      if (this.options.showPath) {
        classes.push('path')
      }
      $ul.classList.add(...classes);
      if ($ul.querySelector('ul')) {
        $ul.classList.add('has-children');
      }
    });
    this.$list.querySelectorAll('li')?.forEach(($li, i) => {
      $li.classList.add('treejs-li');
      const $child = $li.querySelector('ul');
      if ($child) {
        $li.classList.add('has-children', 'hide');
        $li.addEventListener('click', () => {
          $li.classList.toggle('hide');
          $li.classList.toggle('show');
        });
        $child.classList.add('treejs-child');
        $li.prepend(FolderIcon());
        $child.insertAdjacentElement('beforebegin', ChevronIcon());
      } else {
        $li.prepend(FileIcon());
        $li.addEventListener('click', () => {
          $li.classList.toggle('hide');
          $li.classList.toggle('show');
        });
      }

      if (this.options.checkbox) {
        const name = $li.dataset.treejsName ?? 'treejs-li-' + i;
        $li.prepend(createCheckbox(name));
      }
    });
  }

  _initEvents() {
    this.$list.querySelectorAll('treejs-child');
  }
}
