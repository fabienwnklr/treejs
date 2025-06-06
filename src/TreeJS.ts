import './scss/style.scss';

import type { TreeJSOptions } from './@types';

import MicroEvent from './lib/MicroEvent';
import MicroPlugin from './lib/MicroPlugin';
import { TreeJSDefaultsOptions } from './constants';
import { deepMerge } from './utils/functions';
import { ChevronIcon, FileIcon, FolderIcon, findNodeByType, stringToHTMLElement } from './utils/dom';

import ContextMenu from './plugins/context-menu/plugin';
import Checkbox from './plugins/checkbox/plugin';

export declare interface TreeElement extends HTMLUListElement {
  treejs?: TreeJS;
}

export class TreeJS extends MicroPlugin(MicroEvent) {
  $list: TreeElement;
  options: TreeJSOptions;
  $liList!: NodeListOf<HTMLLIElement>;
  constructor($list: TreeElement | string, options: Partial<TreeJSOptions> = {}) {
    super();

    if (typeof $list === 'string') {
      const $ul = document.getElementById($list);

      if (!$ul) {
        throw new Error(`TreeJS Error: cannot find element with id ${$list}`);
      }

      if ($ul instanceof HTMLUListElement) {
        this.$list = $ul as HTMLUListElement;
      } else {
        throw new Error(`TreeJS Error: target must be an instance of HTMLUListElement, actual is ${$ul.nodeType}`);
      }
    } else {
      this.$list = $list;
    }

    this.$list.treejs = this;
    this.options = deepMerge<TreeJSOptions>(TreeJSDefaultsOptions, options);

    this._buildHtml();
    this._bindEvent();

    this.initializePlugins(this.options.plugins);
    // this.onInit = () => console.log("test");

    // this.on('init', this.onInit);
    this.trigger('init');
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

        $li.classList.add('treejs-li');
        const $child = $li.querySelector('ul');

        const $anchorWrapper = stringToHTMLElement<HTMLSpanElement>(
          `<span class="treejs-anchor-wrapper">
            <a class="treejs-anchor" href="#">${textNode.textContent}</a>
          </span>`
        );

        if ($child) {
          $anchorWrapper.prepend(FolderIcon());
          $anchorWrapper.append(ChevronIcon());
          $li.classList.add('has-children', 'hide');
          $li.replaceChild($anchorWrapper, textNode);

          $anchorWrapper.querySelector('.treejs-anchor')?.addEventListener('click', (event) => {
            event.stopImmediatePropagation();
            event.stopPropagation();

            $li.classList.toggle('hide');
            $li.classList.toggle('show');

            this.trigger('click', {
              target: $li,
              event: event,
            });
          });
          $child.classList.add('treejs-child');
          // $li.prepend(FolderIcon());
        } else {
          $anchorWrapper.prepend(FileIcon());
          $li.replaceChild($anchorWrapper, textNode);
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
      $checkbox.forEach(($c) => {
        data.push({ name: $c.name, checked: $c.checked });
      });
    }

    return data;
  }
}

TreeJS.define('context-menu', ContextMenu);
TreeJS.define('checkbox', Checkbox);
