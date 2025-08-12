import './scss/style.scss';

import MicroEvent from '@lib/MicroEvent';
import MicroPlugin from '@lib/MicroPlugin';
import { TreeJSConsole } from '@utils/console';
import {
  animateHeight,
  createAnchorElement,
  findNodeByType,
  JSONToHTMLElement,
  parseNode,
  skeletonLoader,
  stringToHTMLElement,
} from '@utils/dom';
import { TreeJSError, TreeJSTypeError } from '@utils/error';
import {
  _getLiName,
  bindAllMethods,
  collectFolderNames,
  deepMerge,
  getAttributes,
  isValidOptions,
  validateAttributes,
} from '@utils/functions';
import i18n from 'i18next';
// !! Types !! \\
import type { TreeElement, TreeJSEvents, TreeJSJSON, TreeJSOptions } from '@/@types';
import { TreeJSDefaultsOptions } from '@/constants';
import { Icons } from '@/Icons';
// Translation
import { resources } from '@/locales';
// !! Plugins !!
import Checkbox from './plugins/checkbox/plugin';
import ContextMenu from './plugins/context-menu/plugin';

const locale = navigator.language || 'en';

i18n.init({
  debug: true,
  fallbackLng: 'en',
  lng: locale,
  resources,
});

export class TreeJS extends MicroPlugin(MicroEvent<TreeJSEvents>) {
  t: typeof i18n.t = i18n.t;
  $list: TreeElement;
  options: TreeJSOptions;
  $liList!: NodeListOf<HTMLLIElement>;

  _loading: Record<string, boolean> = {};
  _data: Record<string, TreeJSJSON | string> = {};
  _prefix = 'treejs-';
  _data_attribute = `data-${this._prefix}`;
  _ul_class = `${this._prefix}ul`;
  _li_class = `${this._prefix}li`;
  _child_class = `${this._prefix}child`;
  _anchor_class = `${this._prefix}anchor`;
  _icon_class = `${this._prefix}icon`;
  /**
   * List of available attributes for the TreeJS UL nodes.
   * These attributes can be used to configure the nodes in the tree.
   * It's easier to use these attributes in HTML than to use the options object.
   */
  _available_ul_attributes = [
    {
      description: 'Name of the node, used to identify the node in the tree.',
      name: 'name',
      type: 'string',
    },
    {
      description: 'Boolean attribute to indicate if the node is closed by default.',
      name: 'open',
      type: 'boolean',
    },
  ];
  /**
   * List of available attributes for the TreeJS LI nodes.
   * These attributes can be used to configure the nodes in the tree.
   * It's easier to use these attributes in HTML than to use the options object.
   */
  _available_li_attributes = [
    {
      description: 'Boolean attribute to indicate if the node is closed by default.',
      name: 'open',
      type: 'boolean',
    },
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
    {
      description: 'URL to fetch data for the node. The data can be in JSON or HTML format.',
      name: 'fetch-url',
      type: 'string',
    },
    {
      description: 'Boolean attribute to indicate if the child nodes should be opened by default.',
      name: 'open-child',
      type: 'boolean',
    },
  ];
  /**
   * Create a new TreeJS instance.
   * @param $list - The target element or the id of the target element where the tree will be rendered.
   * @param {Partial<TreeJSOptions>} options - The options to configure the tree.
   * @throws {TreeJSError} if the target element is not found or is not an instance of HTMLUListElement.
   * @throws {TreeJSError} if the options are invalid.
   */
  constructor($list: TreeElement | string, options: Partial<TreeJSOptions> = {}) {
    super();

    if (typeof $list === 'string') {
      if (!$list) {
        throw new TreeJSError(`id cannot be empty`);
      }

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
      if (!$list) {
        throw new TreeJSError(`id is null or undefined`);
      }
      this.$list = $list;
    }

    // Validate options, inform user if options are invalid with warning message in console
    isValidOptions(options, TreeJSDefaultsOptions);

    this.$list.treejs = this;
    this.options = deepMerge<TreeJSOptions>(TreeJSDefaultsOptions, options);

    Icons._prefix = this._prefix;
    Icons._icon_class = this._icon_class;

    this._bindThis();
    this._buildHtml();
    this._bindEvents();

    this.initializePlugins(this.options.plugins);

    setTimeout(() => {
      this.trigger('initialize', {
        target: this.$list,
      });
    }, 1);
  }

  /**
   * Initialize all .treejs elements in the document with the provided options.
   *
   * @param {Partial<TreeJSOptions>} options - The options to configure the tree.
   * @throws {TreeJSError} if options is not an object.
   * @throws {TreeJSError} if no ul.treejs elements are found in the document.
   * This method will initialize all TreeJS instances in the document with the provided options.
   * It will search for all ul elements with the class treejs and create a new TreeJS instance for each of them.
   * If no ul.treejs elements are found, it will throw an error.
   * @example
   * TreeJS.init({ showPath: false, openOnDblClick: true });
   * @memberof TreeJS
   * @static
   * @public
   * @returns {void}
   * @throws {TreeJSError} if no ul.treejs elements are found in the document.
   * @description
   * This method is useful to initialize all TreeJS instances in the document with the same options.
   * It can be called once at the beginning of your application to set up the trees.
   *
   * @see {@link TreeJSOptions} for available options.
   * @see {@link TreeJSDefaultsOptions} for default options.
   */
  static init(options: Partial<TreeJSOptions> = {}): TreeJS | TreeJS[] {
    if (typeof options !== 'object') {
      throw new TreeJSError(`options must be an object, actual is ${typeof options}`);
    }

    const $trees = document.querySelectorAll<HTMLUListElement>('ul.treejs');
    if ($trees.length === 0) {
      throw new TreeJSError('No ul.treejs elements found in the document.');
    }
    // Initialize each tree with the provided options
    const trees = Array.from($trees).map(($tree) => new TreeJS($tree, options));

    if (trees.length === 1) {
      // If only one tree is found, return the instance directly
      return trees[0];
    }
    // If multiple trees are found, return an array of instances
    return trees;
  }

  /**
   * Bind `this` to event handlers
   * used to ensure that `this` refers to the TreeJS instance when the event handler is called
   */
  private _bindThis(): void {
    bindAllMethods(this);
  }

  /**
   * Build the HTML structure of the tree.
   */
  private _buildHtml(): void {
    this.$list.classList.add(this._ul_class, this.options.showPath ? 'path' : 'no-path');
    const ULAttributes = getAttributes(this._data_attribute, this.$list);
    validateAttributes(ULAttributes, this._available_ul_attributes);
    this.$liList = this.$list.querySelectorAll('li');
    this._buildList(this.$liList);
  }

  /**
   * Build the list from the NodeListOf HTMLLIElement.
   * @param {NodeListOf<HTMLLIElement>} $liList - NodeListOf HTMLLIElement
   */
  private _buildList($liList: NodeListOf<HTMLLIElement>): void {
    const toOpen = new Set<string>();

    for (const $li of $liList) {
      const textNode = findNodeByType($li.childNodes, '#text');
      const name = _getLiName($li, textNode);

      if (!name) {
        throw new TreeJSError(`Can not find or create name from li element`);
      }

      const LIAttributes = getAttributes(this._data_attribute, $li);
      validateAttributes(LIAttributes, this._available_li_attributes);

      if (!textNode) {
        throw new TreeJSError(`Canot find textNode from li element`);
      }
      if (!textNode.textContent) {
        throw new TreeJSError(`Canot find textContent from textNode`);
      }

      $li.classList.add(this._li_class);
      const $child = $li.querySelector('ul');
      const open = Boolean($li?.getAttribute(`${this._data_attribute}open`) === 'true');
      const openChild = Boolean($li?.getAttribute(`${this._data_attribute}open-child`) === 'true');
      const fetchUrl = $li?.getAttribute(`${this._data_attribute}fetch-url`) || '';
      const $anchor = createAnchorElement(textNode, this._anchor_class);

      if ($child || fetchUrl) {
        const folderIcon = Icons.get('folder', this.options.icons?.folder ?? '');
        $anchor.prepend(folderIcon);
        const chevronIcon = Icons.get('chevron', this.options.icons?.chevron ?? '');
        $anchor.append(chevronIcon);

        $li.classList.add('hide');
        $li.replaceChild($anchor, textNode);
        $li.classList.add('has-children');

        if ($child) {
          $child.classList.add(this._ul_class, this._child_class, this.options.showPath ? 'path' : 'no-path');
        }
      } else {
        const fileIcon = Icons.get('file', this.options.icons?.file ?? '');
        $anchor.prepend(fileIcon);
        $li.replaceChild($anchor, textNode);
      }

      $li.setAttribute(`${this._data_attribute}name`, name);

      if (open) {
        toOpen.add(name);
      }
      if (openChild && $child) {
        collectFolderNames($child, toOpen);
      }
    }

    toOpen.forEach((name) => {
      const func = () => {
        this.open(name);
        this.off('initialize', func);
      };
      this.on('initialize', func);
    });
  }

  /**
   * Attach event listeners to the tree elements.
   */
  protected _bindEvents(): void {
    this.$list.querySelectorAll(`.${this._li_class}.has-children > .${this._anchor_class}`).forEach(($anchor) => {
      if (this.options.openOnDblClick) {
        $anchor.removeEventListener('dblclick', this._handleToggle);
        $anchor.addEventListener('dblclick', this._handleToggle);
      } else {
        $anchor.removeEventListener('click', this._handleToggle);
        $anchor.addEventListener('click', this._handleToggle);
      }
    });

    this.$list.querySelectorAll(`.${this._li_class}:not(.has-children) .${this._anchor_class}`).forEach(($anchor) => {
      $anchor.removeEventListener('click', this._handleSelect);
      $anchor.addEventListener('click', this._handleSelect);
    });
  }

  /**
   * Handle the toggle action for a node.
   * @param {Event} event - The event that triggered the toggle action.
   */
  private _handleToggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const $li = (event.currentTarget as HTMLElement).closest(`.${this._li_class}`) as HTMLLIElement;
    if ($li) {
      const name = $li.getAttribute(`${this._data_attribute}name`) || '';
      this.toggle(name);
    }
  }

  private _handleSelect(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    TreeJSConsole.info('select', event);

    const $li = (event.currentTarget as HTMLElement).closest(`.${this._li_class}`) as HTMLLIElement;
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
    const $li = this.$list.querySelector(`.${this._li_class}[${this._data_attribute}name="${name}"]`) as HTMLLIElement;
    if (!$li) {
      throw new TreeJSError(`cannot find element with name ${name}`);
    }

    if ($li.classList.contains('has-children')) {
      return $li.classList.contains('hide') ? 'closed' : 'open';
    }
    return undefined; // No children, no state
  }

  /**
   * Toggle a node by its name
   * @param name - The name of the node to toggle
   * @throws {TreeJSError} if the node does not exist or is not a parent node.
   */
  toggle(name: string): void {
    const $li = this.$list.querySelector(`.${this._li_class}[${this._data_attribute}name="${name}"]`) as HTMLLIElement;
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
    const $li = this.$list.querySelector(`.${this._li_class}[${this._data_attribute}name="${name}"]`) as HTMLLIElement;
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
    const iconEl = $li.querySelector(`.${this._icon_class}`) as HTMLElement | null;
    if (iconEl) {
      iconEl.classList.remove('animate-out', 'animate-in');
      iconEl.classList.add('animate-in');
      iconEl.addEventListener(
        'transitionend',
        function handler(this: TreeJS) {
          iconEl.removeEventListener('transitionend', handler);
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
      newIcon.classList.add(this._icon_class);
      $li.querySelector(`.${this._anchor_class}`)?.prepend(newIcon);
    }

    // adapt height of the list
    const $ul = $li.querySelector('ul');
    if ($ul) {
      if (isHidden) {
        animateHeight($ul);
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

  /**
   * Close a node by its name
   *
   * @param name - The name of the node to close
   * @throws {TreeJSError} if the node does not exist or is not a parent node.
   *
   * This method will close the node and hide its children.
   * It will also trigger the `close` event.
   */
  close(name: string): void {
    const $li = this.$list.querySelector(`.${this._li_class}[${this._data_attribute}name="${name}"]`) as HTMLLIElement;
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

    const iconEl = $li.querySelector(`.${this._icon_class}`);
    if (iconEl) {
      iconEl.classList.remove('animate-out', 'animate-in');
      iconEl.classList.add('animate-in');
      iconEl.addEventListener(
        'transitionend',
        function handler(this: TreeJS) {
          iconEl.removeEventListener('transitionend', handler);
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
      newIcon.classList.add(this._icon_class);
      $li.querySelector(`.${this._anchor_class}`)?.prepend(newIcon);
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
    this.$list
      .querySelectorAll<HTMLAnchorElement>(`.${this._li_class}.has-children .${this._anchor_class}`)
      .forEach(($link) => {
        $link.click();
      });
  }

  /**
   * Convert the tree structure to a TreeJSJSON representation.
   * @returns {TreeJSJSON[]} An array of JSON objects representing the tree structure.
   */
  toJSON(): TreeJSJSON[] {
    const result: TreeJSJSON[] = [];

    const topLevelLis = this.$list.querySelectorAll(':scope > li') as NodeListOf<HTMLLIElement>;
    for (const li of topLevelLis) {
      result.push(parseNode(li, this._data_attribute, this._anchor_class));
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

    if (!name) {
      throw new TreeJSError(`Element with name ${name} does not exist.`);
    }

    this._loading[name || ''] = true;
    let $ul = $li.querySelector('ul');
    if (!$ul) {
      $ul = document.createElement('ul');
      $li.appendChild($ul);
    }
    $ul.classList.add(this._ul_class, this._child_class, this.options.showPath ? 'path' : 'no-path');
    $ul.append(skeletonLoader(this._prefix));
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
      const error = await data.text();
      this._loading[name || ''] = false;
      this.trigger('fetch-error', {
        error,
        name,
        target: $li,
        uri,
      });
      throw new TreeJSError(`failed to fetch data from ${uri}`);
    }

    // simulate a delay to show the loader icon
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    const isJSON = data.headers.get('content-type')?.includes('application/json');
    const isHTML = data.headers.get('content-type')?.includes('text/html');
    const response = isJSON ? await data.json() : await data.text();

    this._data[name || ''] = response;
    this._loading[name || ''] = false;

    let html: HTMLLIElement;
    if (isJSON) {
      html = JSONToHTMLElement<HTMLLIElement>(response);
    } else if (isHTML) {
      html = stringToHTMLElement<HTMLLIElement>(response as string);
    } else {
      throw new TreeJSError(`Invalid response type from ${uri}. Expected JSON or HTML.`);
    }

    const $liList = html.parentElement?.querySelectorAll('li') as NodeListOf<HTMLLIElement>;

    this._buildList($liList);

    if (this.plugins.loaded.checkbox) {
      this.plugins.loaded.checkbox._buildCheckboxes($liList, $li);
    }

    $ul.innerHTML = '';
    $ul.appendChild(html);

    this.trigger('fetched', {
      name: name,
      response: data,
      target: $li,
    });

    this._bindEvents();
  }

  edit(name: string): void {
    if (!name) {
      throw new TreeJSTypeError('Required name is null or undefined');
    }

    const $li = this.$list.querySelector(`.${this._li_class}[${this._data_attribute}name="${name}"]`) as HTMLLIElement;
    if (!$li) {
      throw new TreeJSError(`cannot find element with name ${name}`);
    }

    const $liLabel = $li.querySelector(`.${this._anchor_class}-label`) as HTMLSpanElement;

    if (!$liLabel) {
      throw new TreeJSError(`element with name ${name} does not have a label`);
    }
    $liLabel.classList.add('editing');
    $liLabel.setAttribute('contenteditable', 'true');
    $liLabel.setAttribute('spellcheck', 'false');
    $liLabel.setAttribute('tabindex', '1');
    $liLabel.focus();

    $liLabel.addEventListener('click', (e) => {
      e.stopImmediatePropagation();
      e.stopPropagation();
    });

    $liLabel.addEventListener('blur', (e) => {
      e.stopImmediatePropagation();
      e.stopPropagation();
      $liLabel.classList.remove('editing');
      $liLabel.removeAttribute('contenteditable');
      $liLabel.removeAttribute('spellcheck');
      $liLabel.removeAttribute('tabindex');

      this.trigger('edit', {
        name,
        target: $li,
      });
    });

    $liLabel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.stopImmediatePropagation();
        e.stopPropagation();
        $liLabel.classList.remove('editing');
        $liLabel.removeAttribute('contenteditable');
        $liLabel.removeAttribute('spellcheck');
        $liLabel.removeAttribute('tabindex');

        this.trigger('edit', {
          name,
          target: $li,
        });
      }
    });
  }
}

TreeJS.define('checkbox', Checkbox);
TreeJS.define('context-menu', ContextMenu);
