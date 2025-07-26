import './scss/style.scss';

// !! Types !! \\
import type { TreeElement, TreeJSJSON, TreeJSOptions } from './@types';
import { TreeJSDefaultsOptions } from './constants';
import { Icons } from './Icons';
import MicroEvent from './lib/MicroEvent';
import MicroPlugin from './lib/MicroPlugin';
import Checkbox from './plugins/checkbox/plugin';

// !! Plugins !! \\
import ContextMenu from './plugins/context-menu/plugin';
import { TreeJSConsole } from './utils/console';
import { findNodeByType, JSONToHTMLElement, skeletonLoader, stringToHTMLElement } from './utils/dom';
import { TreeJSError } from './utils/error';
import { _getLiName, deepMerge, getAttributes, isValidAttributes, isValidOptions } from './utils/functions';

export class TreeJS extends MicroPlugin(MicroEvent) {
  $list: TreeElement;
  options: TreeJSOptions;
  $liList!: NodeListOf<HTMLLIElement>;

  _loading: Record<string, boolean> = {};
  _data: Record<string, TreeJSJSON | string> = {};
  _data_attribute = 'data-treejs-';
  /**
   * List of available attributes for the TreeJS UL nodes.
   * These attributes can be used to configure the nodes in the tree.
   * It's easier to use these attributes in HTML than to use the options object.
   */
  _available_ul_attributes = [
    { description: 'Name of the node, used to identify the node in the tree.', name: 'name', type: 'string' },
    {
      description: 'URL to fetch data for the node. The data can be in JSON or HTML format.',
      name: 'fetch-url',
      type: 'string',
    },
    {
      description: 'Boolean attribute to indicate if the node is closed by default.',
      name: 'open',
      type: 'boolean',
    },
  ];
  _available_li_attributes = [
    {
      description: 'Name of the node, used to identify the node in the tree.',
      name: 'name',
      type: 'string',
    },
    {
      description: 'JavaScript function to call when the node is selected.',
      name: 'onselect',
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
    const ULAttributes = getAttributes(this._data_attribute, this.$list);
    isValidAttributes(ULAttributes, this._available_ul_attributes);
    this.$liList = this.$list.querySelectorAll('li');
    this._buildList(this.$liList);
  }

  private _buildList($liList: NodeListOf<HTMLLIElement>): void {
    for (const $li of $liList) {
      const textNode = findNodeByType($li.childNodes, '#text');
      const name = _getLiName($li, textNode);
      const LIAttributes = getAttributes(this._data_attribute, $li);
      isValidAttributes(LIAttributes, this._available_li_attributes);

      if (!textNode) {
        throw new TreeJSError(`Canot find textNode from li element`);
      }
      if (!textNode.textContent) {
        throw new TreeJSError(`Canot find textContent from textNode`);
      }

      $li.classList.add('treejs-li');
      const $child = $li.querySelector('ul');

      const $anchor = stringToHTMLElement<HTMLSpanElement>(
        `<button class="treejs-anchor">
             <span class="treejs-anchor-label">
                  ${textNode.textContent}
             </span>
        </button>`
      );

      if ($child || $li.hasAttribute(`${this._data_attribute}fetch-url`)) {
        const folderIcon = Icons.get('folder', this.options.icons?.folder ?? '');
        $anchor.prepend(folderIcon);

        const chevronIcon = Icons.get('chevron', this.options.icons?.chevron ?? '');
        $anchor.append(chevronIcon);

        const open = $child?.getAttribute(`${this._data_attribute}open`) || '';

        if (open !== 'true') $li.classList.add('has-children', 'hide');
        $li.replaceChild($anchor, textNode);

        if ($child) {
          $child.classList.add('treejs-ul', 'treejs-child', this.options.showPath ? 'path' : 'no-path');

          if ($child.hasAttribute(`${this._data_attribute}fetch-url`)) {
            if (open === 'true') {
              $li.classList.remove('hide');
            }
          }
        }
      } else {
        const fileIcon = Icons.get('file', this.options.icons?.file ?? '');
        $anchor.prepend(fileIcon);
        $li.replaceChild($anchor, textNode);
      }

      $li.setAttribute(`${this._data_attribute}name`, name || '');
    }
  }

  private _attachEvents(): void {
    this.$list.querySelectorAll('.treejs-li.has-children > .treejs-anchor').forEach(($anchor) => {
      if (this.options.openOnDblClick) {
        $anchor.removeEventListener('dblclick', this._handleToggle);
        $anchor.addEventListener('dblclick', this._handleToggle);
      } else {
        $anchor.removeEventListener('click', this._handleToggle);
        $anchor.addEventListener('click', this._handleToggle);
      }
    });

    this.$list.querySelectorAll('.treejs-li:not(.has-children) .treejs-anchor').forEach(($anchor) => {
      $anchor.removeEventListener('click', this._handleSelect);
      $anchor.addEventListener('click', this._handleSelect);
    });
  }

  private _handleToggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const $li = (event.currentTarget as HTMLElement).closest('.treejs-li') as HTMLLIElement;
    if ($li) {
      const name = $li.getAttribute(`${this._data_attribute}name`) || '';
      this.toggle(name);
    }
  }
  private _handleSelect(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    TreeJSConsole.info('select', event);

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
        name: name,
        target: $li,
      });
    }
  }

  /**
   * Get the state of a node by its name
   * @param name - The name of the node
   * @returns The state of the node open/closed, or undefined if the node does not exist
   */
  getState(name: string): 'open' | 'closed' | undefined {
    const $li = this.$list.querySelector(`.treejs-li[${this._data_attribute}name="${name}"]`) as HTMLLIElement;
    if (!$li) {
      throw new TreeJSError(`cannot find element with name ${name}`);
    }

    if ($li.classList.contains('has-children')) {
      return $li.classList.contains('hide') ? 'closed' : 'open';
    }
    return undefined; // No children, no state
  }

  toggle(name: string): void {
    const $li = this.$list.querySelector(`.treejs-li[${this._data_attribute}name="${name}"]`) as HTMLLIElement;
    if (!$li) {
      throw new TreeJSError(`cannot find element with name ${name}`);
    }

    if (!$li.classList.contains('has-children')) {
      throw new TreeJSError(`element with name ${name} is not a parent node`);
    }

    const isHidden = $li.classList.contains('hide');
    if (isHidden) {
      this.open(name);
    } else {
      this.close(name);
    }
  }

  /**
   * Open a node by its name
   * This method will throw an error if the node does not exist or is not a parent node.
   * @param name - The name of the node to open
   * @throws {TreeJSError} if the node does not exist or is not a
   */
  open(name: string): void {
    const $li = this.$list.querySelector(`.treejs-li[${this._data_attribute}name="${name}"]`) as HTMLLIElement;
    if (!$li) {
      throw new TreeJSError(`cannot find element with name ${name}`);
    }
    if (!$li.classList.contains('has-children')) {
      throw new TreeJSError(`element with name ${name} is not a parent node`);
    }

    const isHidden = $li.classList.contains('hide');
    if (!isHidden) {
      return; // already open
    }

    const needFetch = $li.hasAttribute(`${this._data_attribute}fetch-url`);
    const iconEl = $li.querySelector('.treejs-icon');
    if (iconEl) {
      iconEl.classList.remove('animate-out', 'animate-in');
      iconEl.classList.add('animate-in');
      iconEl.addEventListener(
        'transitionend',
        function handler(this: TreeJS) {
          iconEl.removeEventListener('transitionend', handler as EventListener);
          const newIcon = isHidden
            ? Icons.get('folderOpen', this.options.icons?.folderOpen ?? '')
            : Icons.get('folder', this.options.icons?.folder ?? '');
          iconEl.replaceWith(newIcon);
          newIcon.classList.add('animate-out');
        }.bind(this),
        { once: true }
      );
    } else {
      // fallback if no icon found
      const newIcon = isHidden
        ? Icons.get('folderOpen', this.options.icons?.folderOpen ?? '')
        : Icons.get('folder', this.options.icons?.folder ?? '');
      newIcon.classList.add('treejs-icon');
      $li.querySelector('.treejs-anchor')?.prepend(newIcon);
    }

    // adapt height of the list
    const $ul = $li.querySelector('ul');
    if ($ul) {
      if (isHidden) {
        const targetHeight = $ul.scrollHeight + 'px';
        $ul.style.height = targetHeight;
        $ul.addEventListener('transitionend', function handler(e) {
          if (e.propertyName === 'height') {
            $ul.style.height = 'auto';
            $ul.removeEventListener('transitionend', handler);
          }
        });
      } else {
        $ul.style.height = $ul.scrollHeight + 'px'; // 1. fixe la hauteur courante
        void $ul.offsetWidth; // 2. force le reflow
        $ul.style.height = '0px';
      }
    }

    if ($li.classList.contains('has-children') && needFetch) {
      const uri = $li.getAttribute(`${this._data_attribute}fetch-url`) || '';
      if (isHidden && !this._data[name] && !this._loading[name]) {
        this._loadFromURI(uri, $li);
      }
    }
    $li.classList.remove('hide');
    $li.classList.add('show');

    this.trigger('open', {
      name: name,
      target: $li,
    });
  }

  close(name: string): void {
    const $li = this.$list.querySelector(`.treejs-li[${this._data_attribute}name="${name}"]`) as HTMLLIElement;
    if (!$li) {
      throw new TreeJSError(`cannot find element with name ${name}`);
    }
    if (!$li.classList.contains('has-children')) {
      throw new TreeJSError(`element with name ${name} is not a parent node`);
    }

    const isHidden = $li.classList.contains('hide');

    if (isHidden) {
      return; // already closed
    }

    const iconEl = $li.querySelector('.treejs-icon');
    if (iconEl) {
      iconEl.classList.remove('animate-out', 'animate-in');
      iconEl.classList.add('animate-in');
      iconEl.addEventListener(
        'transitionend',
        function handler(this: TreeJS) {
          iconEl.removeEventListener('transitionend', handler as EventListener);
          const newIcon = isHidden
            ? Icons.get('folderOpen', this.options.icons?.folderOpen ?? '')
            : Icons.get('folder', this.options.icons?.folder ?? '');
          iconEl.replaceWith(newIcon);
          newIcon.classList.add('animate-out');
        }.bind(this),
        { once: true }
      );
    } else {
      // fallback if no icon found
      const newIcon = isHidden
        ? Icons.get('folderOpen', this.options.icons?.folderOpen ?? '')
        : Icons.get('folder', this.options.icons?.folder ?? '');
      newIcon.classList.add('treejs-icon');
      $li.querySelector('.treejs-anchor')?.prepend(newIcon);
    }

    // adapt height of the list
    const $ul = $li.querySelector('ul');
    if ($ul) {
      if (isHidden) {
        const targetHeight = $ul.scrollHeight + 'px';
        $ul.style.height = targetHeight;
        $ul.addEventListener('transitionend', function handler(e) {
          if (e.propertyName === 'height') {
            $ul.style.height = 'auto';
            $ul.removeEventListener('transitionend', handler);
          }
        });
      } else {
        $ul.style.height = $ul.scrollHeight + 'px'; // 1. fixe la hauteur courante
        void $ul.offsetWidth; // 2. force le reflow
        $ul.style.height = '0px';
      }
    }

    $li.classList.remove('show');
    $li.classList.add('hide');

    this.trigger('close', {
      name: name,
      target: $li,
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

      return { children, label, name };
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

    this._loading[name || ''] = true;
    let $ul = $li.querySelector('ul');
    if (!$ul) {
      $ul = document.createElement('ul');
      $li.appendChild($ul);
    }
    $ul.classList.add('treejs-ul', 'treejs-child', this.options.showPath ? 'path' : 'no-path');
    $ul.append(skeletonLoader());
    $ul.style.height = '0px';

    void $ul.offsetWidth;

    $ul.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'height') {
        $ul.style.height = 'auto';
        $ul.removeEventListener('transitionend', handler);
      }
    });

    $ul.style.height = $ul.scrollHeight + 'px';

    this.trigger('fetch', {
      name: name,
      target: $li,
      uri,
    });

    const data = await fetch(uri);
    if (!data.ok) {
      this._loading[name || ''] = false;
      this.trigger('fetch-error', {
        error: data.text(),
        name: name,
        target: $li,
        uri,
      });
      throw new TreeJSError(`failed to fetch data from ${uri}`);
    }

    this.trigger('fetched', {
      name: name,
      response: data,
      target: $li,
    });

    // simulate a delay to show the loader icon
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    const isJSON = data.headers.get('content-type')?.includes('application/json');
    const isHTML = data.headers.get('content-type')?.includes('text/html');
    const response = isJSON ? await data.json() : await data.text();

    this._data[name || ''] = response;
    this._loading[name || ''] = false;

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
