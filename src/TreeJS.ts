import './scss/style.scss';

import type { TreeJSOptions } from './@types';

import MicroEvent from './lib/MicroEvent'
import MicroPlugin from './lib/MicroPlugin';
import { TreeJSDefaultsOptions } from './constants';
import { deepMerge } from './utils/functions';
import { ChevronIcon, FileIcon, FolderIcon, createCheckbox, findNodeByType, stringToHTMLElement } from './utils/dom';

export class TreeJS extends MicroPlugin(MicroEvent) {
  
  $list: HTMLUListElement;
  options: TreeJSOptions;
  $liList!: NodeListOf<HTMLLIElement>;
  constructor($list: HTMLUListElement, options: Partial<TreeJSOptions>) {
    super();
    this.$list = $list;
    this.options = deepMerge<TreeJSOptions>(TreeJSDefaultsOptions, options);

    this._buildHtml();
    this._bindEvent();

    console.log(this)
    // this.onInit = () => console.log("test");

    // this.on('init', this.onInit);
    // this.trigger('init');
  }

  _buildHtml() {
    this.$list.classList.add('treejs');
    this.$list.querySelectorAll('ul')?.forEach(($ul) => {
      const classes = ['treejs-ul'];

      if (this.options.showPath) {
        classes.push('path');
      }
      $ul.classList.add(...classes);
      if ($ul.querySelector('ul')) {
        $ul.classList.add('has-children');
      }
    });

    this.$liList = this.$list.querySelectorAll('li');

    if (this.$liList) {
      this.$liList.forEach(($li) => {
        const textNode = findNodeByType($li.childNodes, '#text');

        if (!textNode) {
          throw new Error(`TreeJsError : Canot find textNode from li element`);
        }
        if (!textNode.textContent) {
          throw new Error(`TreeJsError : Canot find textContent from textNode`);
        }

        let $checkbox: HTMLInputElement | null = null;
        if (this.options.checkbox) {
          const name = $li.dataset.treejsName ?? textNode.textContent.trim().replace(/\W/g,'_').toLowerCase();
          $checkbox = createCheckbox(name);
          $li.prepend($checkbox);
        }

        $li.classList.add('treejs-li');
        const $child = $li.querySelector('ul');
        
        const $link = stringToHTMLElement<HTMLAnchorElement>(
          `<a class="treejs-anchor" href="#">${textNode.textContent}</a>`
        );

        $link.addEventListener('click', () => {
          $li.classList.add('selected');
        });
        $link.addEventListener('focusout', () => {
          $li.classList.remove('selected');
        });
        if ($child) {
          $li.classList.add('has-children', 'hide');
          $li.replaceChild($link, textNode);
          const $chevronIcon = ChevronIcon();

          $chevronIcon.addEventListener('click', (event) => {
            event.stopImmediatePropagation();
            event.stopPropagation();

            $li.classList.toggle('hide');
            $li.classList.toggle('show');
          });
          $child.classList.add('treejs-child');
          $child.insertAdjacentElement('beforebegin', $chevronIcon);
          $li.prepend(FolderIcon());
        } else {
          $li.replaceChild($link, textNode);
          $li.prepend(FileIcon());
        }

        if ($checkbox) {
          const $a = $checkbox
          $checkbox.addEventListener('change', () => {
            if ($child) {
              $child.querySelectorAll('input').forEach(($input) => {
                $input.checked = $a.checked;
              });
            }
          });
        }
      });
    }
  }

  _bindEvent() {
    this.$list.querySelectorAll('treejs-child');
  }

  getSelected() {
    return this.$list.querySelector('.selected');
  }

  getChecked() {
    const $checkbox = this.$list.querySelectorAll('input');
    const data: object[] = [];
    if ($checkbox) {
      $checkbox.forEach($c => {
        data.push({name: $c.name, checked: $c.checked});
      });
    }

    return data;
  }
}
