import './scss/style.scss';

// !! Types !! \\
import type { TreeElement, TreeJSJSON, TreeJSOptions } from './@types';

import MicroEvent from './lib/MicroEvent';
import MicroPlugin from './lib/MicroPlugin';
import { TreeJSDefaultsOptions } from './constants';
import { _getLiName, deepMerge, isValidOptions } from './utils/functions';
import { findNodeByType, getIcon, JSONToHTMLElement, stringToHTMLElement } from './utils/dom';

// !! Plugins !! \\
import ContextMenu from './plugins/context-menu/plugin';
import Checkbox from './plugins/checkbox/plugin';
import { TreeJSError } from './utils/error';

export class TreeJS extends MicroPlugin(MicroEvent) {
  $list: TreeElement;
  options: TreeJSOptions;
  $liList!: NodeListOf<HTMLLIElement>;

  _data: { [key: string]: TreeJSJSON | string } = {};
  _data_attribute = 'data-treejs-';
  _available_attributes = [
    { name: 'name', description: 'Name of the node, used to identify the node in the tree.', type: 'string' },
    {
      name: 'fetch-url',
      description: 'URL to fetch data for the node. The data can be in JSON or HTML format.',
      type: 'string',
    },
    {
      name: 'icon',
      description: 'Custom icon for the node. It can be an SVG string or a URL to an image.',
      type: 'string',
    },
  ];

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

    this._bindThis();
    this._buildHtml();
    this._attachEvents();

    this.initializePlugins(this.options.plugins);
    this.trigger('init');
  }

  /**
   * Bind `this` to event handlers
   * used to ensure that `this` refers to the TreeJS instance when the event handler is called
   */
  private _bindThis(): void {
    this._handleToggle = this._handleToggle.bind(this);
    this._handleSelect = this._handleSelect.bind(this);
  }

  private _buildHtml(): void {
    this.$list.classList.add('treejs-ul', this.options.showPath ? 'path' : 'no-path');
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
              <a class="treejs-anchor" tabindex="0">${textNode.textContent}</a>
            </span>`
      );

      if ($child || $li.hasAttribute(`${this._data_attribute}fetch-url`)) {
        const folderIcon = getIcon('folder', this.options.icons?.folder ?? '');
        const chevronIcon = getIcon('chevron');
        $anchorWrapper.prepend(folderIcon);
        $anchorWrapper.append(chevronIcon);
        $li.classList.add('has-children', 'hide');
        $li.replaceChild($anchorWrapper, textNode);
        $child?.classList.add('treejs-ul', 'treejs-child', this.options.showPath ? 'path' : 'no-path');
      } else {
        const fileIcon = getIcon('file', this.options.icons?.file ?? '');
        $anchorWrapper.prepend(fileIcon);
        $li.replaceChild($anchorWrapper, textNode);
      }

      $li.setAttribute(`${this._data_attribute}name`, name || '');
    }
  }

  private _attachEvents(): void {
    this.$list
      .querySelectorAll('.treejs-li.has-children > .treejs-anchor-wrapper > .treejs-anchor')
      .forEach(($anchor) => {
        if (this.options.openOnDblClick) {
          $anchor.removeEventListener('dblclick', this._handleToggle);
          $anchor.addEventListener('dblclick', this._handleToggle);
        } else {
          $anchor.removeEventListener('click', this._handleToggle);
          $anchor.addEventListener('click', this._handleToggle);
        }
      });

    this.$list.querySelectorAll('.treejs-li .treejs-anchor').forEach(($anchor) => {
      $anchor.removeEventListener('click', this._handleSelect);
      $anchor.addEventListener('click', this._handleSelect);
    });
  }

  private _handleToggle(event: Event): void {
    event.stopImmediatePropagation();
    event.stopPropagation();

    const $li = (event.currentTarget as HTMLElement).closest('.treejs-li') as HTMLLIElement;
    if ($li) {
      const name = $li.getAttribute(`${this._data_attribute}name`) || '';
      this.toggle(name);
    }
  }
  private _handleSelect(event: Event): void {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const $li = (event.currentTarget as HTMLElement).closest('.treejs-li') as HTMLLIElement;
    if ($li) {
      const name = $li.getAttribute(`${this._data_attribute}name`) || '';
      if ($li.hasAttribute(`${this._data_attribute}onselect`)) {
        const onSelect = $li.getAttribute(`${this._data_attribute}onselect`);
        if (onSelect) {
          const fn = new Function('event', onSelect);
          fn(event, this, $li);
        }
      }
      this.trigger('select', {
        target: $li,
        name: name,
      });
    }
  }

  toggle(name: string): void {
    const $li = this.$list.querySelector(`.treejs-li[${this._data_attribute}name="${name}"]`) as HTMLLIElement;
    if (!$li) {
      throw new TreeJSError(`cannot find element with name ${name}`);
    }

    const isHidden = $li.classList.contains('hide');
    if (!$li.classList.contains('has-children')) {
      throw new TreeJSError(`element with name ${name} is not a parent node`);
    }

    $li.classList.toggle('hide');
    $li.classList.toggle('show');

    if ($li.classList.contains('has-children') && $li.hasAttribute(`${this._data_attribute}fetch-url`)) {
      const uri = $li.getAttribute(`${this._data_attribute}fetch-url`) || '';
      if (isHidden && !this._data[name]) {
        this._loadFromURI(uri, $li);
      }
    }

    this.trigger('toggle', {
      target: $li,
      name: name,
    });
  }

  toggleAll(): void {
    this.$list.querySelectorAll<HTMLAnchorElement>('.treejs-li.has-children .treejs-anchor').forEach(($link) => {
      $link.click();
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

    function parseNode(li: HTMLLIElement, _data_attribute: string): TreeJSJSON {
      const label = li.querySelector('.treejs-anchor')?.textContent || '';
      const name = li.getAttribute(`${_data_attribute}name`) || '';
      const children: TreeJSJSON[] = [];

      const subUl = li.querySelector(':scope > ul');
      if (subUl) {
        const subLis = subUl.querySelectorAll(':scope > li') as NodeListOf<HTMLLIElement>;
        for (const childLi of subLis) {
          children.push(parseNode(childLi, _data_attribute));
        }
      }

      return { label, name, children };
    }

    const topLevelLis = this.$list.querySelectorAll(':scope > li') as NodeListOf<HTMLLIElement>;
    for (const li of topLevelLis) {
      result.push(parseNode(li, this._data_attribute));
    }

    return result;
  }

  private async _loadFromURI(uri: string, $li: HTMLLIElement): Promise<void> {
    if (!uri) {
      throw new TreeJSError(
        `Invalid URI for element with name ${$li.getAttribute(
          `${this._data_attribute}name`
        )}. Please provide a valid URI.`
      );
    }

    const name = $li.getAttribute(`${this._data_attribute}name`);
    let $ul = $li.querySelector('ul');
    if (!$ul) {
      // create empty ul if not exists
      $ul = document.createElement('ul');

      $li.appendChild($ul);
    }

    $ul.classList.add('treejs-ul', 'treejs-child', this.options.showPath ? 'path' : 'no-path');
    $ul.prepend(getIcon('loader'));

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
      html = JSONToHTMLElement<HTMLLIElement>(response);
    } else if (isHTML) {
      html = stringToHTMLElement<HTMLLIElement>(response as string);
    } else {
      throw new TreeJSError(`Invalid response type from ${uri}. Expected JSON or HTML.`);
    }

    const $liList = html.parentElement?.querySelectorAll('li') as NodeListOf<HTMLLIElement>;

    this._buildList($liList);

    $ul.innerHTML = '';
    $ul.appendChild(html);

    this._attachEvents();
  }
}

TreeJS.define('context-menu', ContextMenu);
TreeJS.define('checkbox', Checkbox);
