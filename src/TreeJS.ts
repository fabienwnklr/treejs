import './scss/style.scss';

// !! Types !! \\
import type { TreeJSOptions } from './@types';

import MicroEvent from './lib/MicroEvent';
import MicroPlugin from './lib/MicroPlugin';
import { TreeJSDefaultsOptions } from './constants';
import { deepMerge } from './utils/functions';
import { findNodeByType, getIcon, stringToHTMLElement } from './utils/dom';

// !! Plugins !! \\
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
        const name = $li.dataset.treejsName
          ? $li.dataset.treejsName
          : textNode?.textContent?.trim().replace(/\W/g, '_').toLowerCase();

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
          const folderIcon = getIcon('folder', this.options.icons?.folder ?? '');
          const chevronIcon = getIcon('chevron');
          $anchorWrapper.prepend(folderIcon);
          $anchorWrapper.append(chevronIcon);
          $li.classList.add('has-children', 'hide');
          $li.replaceChild($anchorWrapper, textNode);
          $child.classList.add('treejs-child');
        } else {
          const fileIcon = getIcon('file', this.options.icons?.file ?? '');
          $anchorWrapper.prepend(fileIcon);
          $li.replaceChild($anchorWrapper, textNode);
        }

        $li.setAttribute('data-treejs-name', name || '');
      });
    }
  }

  _bindEvent() {
    this.$list.querySelectorAll('.treejs-li.has-children .treejs-anchor').forEach(($anchor) => {
      $anchor.addEventListener('click', (event) => {
        event.stopImmediatePropagation();
        event.stopPropagation();

        const $li = $anchor.closest('.treejs-li');
        if ($li) {
          $li.classList.toggle('hide');
          $li.classList.toggle('show');
        }

        this.trigger('click', {
          target: $li,
          event: event,
        });
      });
    });
  }

  toggle(name: string) {
    const $li = this.$list.querySelector(`.treejs-li[data-treejs-name="${name}"]`);
    if (!$li) {
      throw new Error(`TreeJS Error: cannot find element with name ${name}`);
    }

    if (!$li.classList.contains('has-children')) {
      throw new Error(`TreeJS Error: element with name ${name} is not a parent node`);
    }

    $li.classList.toggle('hide');
    $li.classList.toggle('show');

    this.trigger('toggle', {
      target: $li,
      name: name,
    });
  }

  toggleAll() {
    this.$list.querySelectorAll('.treejs-li.has-children').forEach(($li) => {
      $li.classList.toggle('hide');
      $li.classList.toggle('show');
    });
  }

  getSelected() {
    return this.$list.querySelector('.selected');
  }

  getChecked() {
    return this.plugins.data.checked;
  }
}

TreeJS.define('context-menu', ContextMenu);
TreeJS.define('checkbox', Checkbox);
