import './scss/style.scss';

// !! Types !! \\
import type { TreeElement, TreeJSJSON, TreeJSOptions } from './@types';

import MicroEvent from './lib/MicroEvent';
import MicroPlugin from './lib/MicroPlugin';
import { TreeJSDefaultsOptions } from './constants';
import { _getLiName, deepMerge, isValidOptions } from './utils/functions';
import { findNodeByType, getIcon, JSONToHTML, stringToHTMLElement } from './utils/dom';

// !! Plugins !! \\
import ContextMenu from './plugins/context-menu/plugin';
import Checkbox from './plugins/checkbox/plugin';
import { TreeJSError } from './utils/error';

export class TreeJS extends MicroPlugin(MicroEvent) {
  $list: TreeElement;
  options: TreeJSOptions;
  $liList!: NodeListOf<HTMLLIElement>;

  _data: { [key: string]: TreeJSJSON | string } = {};

  constructor($list: TreeElement | string, options: Partial<TreeJSOptions> = {}) {
    super();

    if (typeof $list === 'string') {
      const $ul = document.getElementById($list);

      if (!$ul) {
        throw new TreeJSError(`cannot find element with id ${$list}`);
      }

      if ($ul instanceof HTMLUListElement) {
        this.$list = $ul as HTMLUListElement;
      } else {
        throw new TreeJSError(`target must be an instance of HTMLUListElement, actual is ${$ul.nodeType}`);
      }
    } else {
      this.$list = $list;
    }

    // Validate options, inform user if options are invalid with warning message in console
    isValidOptions(options, TreeJSDefaultsOptions);
    this.$list.treejs = this;
    this.options = deepMerge<TreeJSOptions>(TreeJSDefaultsOptions, options);

    this._buildHtml();
    this._bindEvent();

    this.initializePlugins(this.options.plugins);
    // this.onInit = () => console.log("test");

    // this.on('init', this.onInit);
    this.trigger('init');
  }

  private _buildHtml(): void {
    this.$list.classList.add('treejs');
    this.$liList = this.$list.querySelectorAll('li');
    this._buildList(this.$liList);
  }

  private _buildList($liList: NodeListOf<HTMLLIElement>): void {
    for (const $li of $liList) {
      const textNode = findNodeByType($li.childNodes, '#text');
      const name = _getLiName($li, textNode);

      if (!textNode) {
        throw new TreeJSError(`Canot find textNode from li element`);
      }
      if (!textNode.textContent) {
        throw new TreeJSError(`Canot find textContent from textNode`);
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
    }
  }

  private _bindEvent(): void {
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

  toggle(name: string): void {
    const $li = this.$list.querySelector(`.treejs-li[data-treejs-name="${name}"]`) as HTMLLIElement;
    if (!$li) {
      throw new TreeJSError(`cannot find element with name ${name}`);
    }

    const isHidden = $li.classList.contains('hide');
    if (!$li.classList.contains('has-children')) {
      throw new TreeJSError(`element with name ${name} is not a parent node`);
    }

    if ($li.classList.contains('has-children') && $li.hasAttribute('data-treejs-fetch-url')) {
      const uri = $li.getAttribute('data-treejs-fetch-url') || '';
      if (isHidden && !this._data[name]) {
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

  toggleAll(): void {
    this.$list.querySelectorAll('.treejs-li.has-children').forEach(($li) => {
      $li.classList.toggle('hide');
      $li.classList.toggle('show');
    });
  }

  getSelected(): HTMLLIElement | null {
    return this.$list.querySelector('.selected');
  }

  getChecked(): string[] {
    return this.plugins.data.checked ?? [];
  }

  toJSON(): TreeJSJSON[] {
    const result: TreeJSJSON[] = [];

    function parseNode(li: HTMLLIElement): TreeJSJSON {
      const label = li.querySelector('.treejs-anchor')?.textContent || '';
      const name = li.getAttribute('data-treejs-name') || '';
      const children: TreeJSJSON[] = [];

      const subUl = li.querySelector(':scope > ul');
      if (subUl) {
        const subLis = subUl.querySelectorAll(':scope > li') as NodeListOf<HTMLLIElement>;
        for (const childLi of subLis) {
          children.push(parseNode(childLi));
        }
      }

      return { label, name, children };
    }

    const topLevelLis = this.$list.querySelectorAll(':scope > li') as NodeListOf<HTMLLIElement>;
    for (const li of topLevelLis) {
      result.push(parseNode(li));
    }

    return result;
  }

  private async _loadFromURI(uri: string, $li: HTMLLIElement): Promise<void> {
    if (!uri) {
      throw new TreeJSError(
        `Invalid URI for element with name ${$li.getAttribute('data-treejs-name')}. Please provide a valid URI.`
      );
    }

    const name = $li.getAttribute('data-treejs-name');
    const $ul = $li.querySelector('ul');
    if (!$ul) {
      throw new TreeJSError(`cannot find child ul for element with name ${name}`);
    }
    const $loader = stringToHTMLElement<HTMLDivElement>(
      `<div class="treejs-loader">
            <span class="treejs-loader-icon"></span>
          </div>`
    );
    $ul.prepend($loader);

    const data = await fetch(uri);
    if (!data.ok) {
      throw new TreeJSError(`failed to fetch data from ${uri}`);
    }
    const isJSON = data.headers.get('content-type')?.includes('application/json');
    const isHTML = data.headers.get('content-type')?.includes('text/html');
    const response = isJSON ? await data.json() : await data.text();

    this._data[name || ''] = response;

    let html: HTMLLIElement | DocumentFragment = document.createDocumentFragment();
    if (isJSON) {
      html = JSONToHTML(response as TreeJSJSON, this.options.showPath);
    } else if (isHTML) {
      html = stringToHTMLElement<HTMLLIElement>(response as string);

      const $liList = html.querySelectorAll('li') as NodeListOf<HTMLLIElement>;
      this._buildList($liList);
    } else {
      throw new TreeJSError(`Invalid response type from ${uri}. Expected JSON or HTML.`);
    }

    $ul.innerHTML = '';
    $ul.appendChild(html);
    // bind event to new html
    this._bindEvent();
  }
}

TreeJS.define('context-menu', ContextMenu);
TreeJS.define('checkbox', Checkbox);
