import './scss/style.scss';

// !! Types !! \\
import type { TreeJSJSON, TreeJSOptions } from './@types';

import MicroEvent from './lib/MicroEvent';
import MicroPlugin from './lib/MicroPlugin';
import { TreeJSDefaultsOptions } from './constants';
import { deepMerge } from './utils/functions';
import { findNodeByType, getIcon, JSONToHTML, stringToHTMLElement } from './utils/dom';

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

  _data: Record<string, any> = {};

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
          this.toggle($li.getAttribute('data-treejs-name') || '');
        }
      });
    });
  }

  toggle(name: string) {
    const $li = this.$list.querySelector(`.treejs-li[data-treejs-name="${name}"]`) as HTMLLIElement;
    if (!$li) {
      throw new Error(`TreeJS Error: cannot find element with name ${name}`);
    }

    if (!$li.classList.contains('has-children')) {
      throw new Error(`TreeJS Error: element with name ${name} is not a parent node`);
    }

    if ($li.classList.contains('has-children')) {
      const uri = $li.getAttribute('data-treejs-fetch-url') || '';
      // if fetch set for his children, we will fetch data
      if (uri && ! this._data[name]) {
        this._loadFromURI(uri, $li);
      }
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

  toJSON(): Record<string, any> {
    const result: Record<string, any>[] = [];

    function parseNode(li: HTMLLIElement): Record<string, any> {
      const name = li.getAttribute('data-treejs-name') || '';
      const children: Record<string, any>[] = [];

      const subUl = li.querySelector(':scope > ul');
      if (subUl) {
        const subLis = subUl.querySelectorAll(':scope > li') as NodeListOf<HTMLLIElement>;
        subLis.forEach((childLi) => {
          children.push(parseNode(childLi));
        });
      }

      return { name, children };
    }

    const topLevelLis = this.$list.querySelectorAll(':scope > li') as NodeListOf<HTMLLIElement>;
    topLevelLis.forEach((li) => {
      result.push(parseNode(li));
    });

    return result;
  }

  private _loadFromURI(uri: string, $li: HTMLLIElement) {
    if (!uri) {
      throw new Error(
        `TreeJS Error: cannot find data-treejs-fetch-url attribute for element with name ${$li.getAttribute(
          'data-treejs-name'
        )}`
      );
    }

    const name = $li.getAttribute('data-treejs-name');
    // append loader to ul
    const $ul = $li.querySelector('ul');
    if (!$ul) {
      throw new Error(`TreeJS Error: cannot find child ul for element with name ${name}`);
    }
    const $loader = stringToHTMLElement<HTMLDivElement>(
      `<div class="treejs-loader">
            <span class="treejs-loader-icon"></span>
          </div>`
    );
    $ul.prepend($loader);

    fetch(uri)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`TreeJS Error: failed to fetch data from ${uri}`);
        }

        if (response.headers.get('content-type')?.includes('application/json')) {
          return response.json();
        }
      })
      .then((data: TreeJSJSON | TreeJSJSON[]) => {
        const html = JSONToHTML(data);
        this._data[name || ''] = data;

        // replace ul with new html
        $ul.innerHTML = '';
        $ul.appendChild(html);

        // bind event to new html
        this._bindEvent();
      });
  }
}

TreeJS.define('context-menu', ContextMenu);
TreeJS.define('checkbox', Checkbox);
