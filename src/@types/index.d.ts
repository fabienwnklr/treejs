import type { CheckboxPlugin } from '@/plugins/checkbox/@types';
import type { ContextMenuPlugin } from '@/plugins/context-menu/@types';

export interface TreeElement extends HTMLUListElement {
  treejs?: TreeJS;
}

export interface TreeJSOptions {
  // checkbox: boolean;
  showPath: boolean;
  plugins: AvailablePlugins[];
  openOnDblClick: boolean;
  icons?: {
    folder?: string;
    folderOpen?: string;
    file?: string;
    chevron?: string;
    loader?: string;
  };
}

export type AvailablePlugins = 'context-menu' | 'checkbox';

export interface TreeJSJSON {
  label: string;
  name?: string;
  children: TreeJSJSON[];
}

export type TSettings = {
  [key: string]: any;
};

export interface PluginTypes {
  checkbox: CheckboxPlugin;
  'context-menu': ContextMenuPlugin;
}

export interface TreeJSEvents extends Record<string, (...args: any[]) => any> {
  initialize: (payload: { target: TreeElement }) => void;
  select: (payload: {
    /**
     * The name of selected item
     */
    name: string;
    /**
     * The target HTML element of the selected item
     */
    target: HTMLLIElement;
  }) => void;
  open: (payload: {
    /**
     * The name of the item opened
     */
    name: string;
    /**
     * The target HTML element of the opened item
     */
    target: HTMLLIElement;
  }) => void;
  close: (payload: {
    /**
     * The name of the item closed
     */
    name: string;
    /**
     * The target HTML element of the closed item
     */
    target: HTMLLIElement;
  }) => void;
  fetch: (payload: {
    /**
     * The name of the item being fetched
     */
    name: string;
    /**
     * The target HTML element of the item being fetched
     */
    target: HTMLLIElement;
    /**
     * The URI from which the item is being fetched
     */
    uri: string;
  }) => void;
  fetched: (payload: {
    /**
     * The name of the item that was fetched
     */
    name: string;
    /**
     * The response object from the fetch operation
     */
    response: Response;
    /**
     * The target HTML element of the fetched item
     */
    target: HTMLLIElement;
  }) => void;
  'fetch-error': (payload: {
    /**
     * Error message
     */
    error: string;
    /**
     * The name of the item that encountered an error during fetch
     */
    name: string;
    /**
     * The target HTML element of the item that encountered an error during fetch
     */
    target: HTMLLIElement;
    /**
     * The URI that was attempted to be fetched
     */
    uri: string;
  }) => void;
  edit: (payload: {
    /**
     * The name of the item being edited
     */
    name: string;
    /**
     * The target HTML element of the item being edited
     */
    target: HTMLLIElement;
  }) => void;
}

export type TPlugins = {
  names: string[];
  settings: TSettings;
  requested: Record<string, boolean>;
  loaded: { [K in keyof PluginTypes]?: PluginTypes[K] };
  data: Record<string, any>;
};

export type TPluginItem = { name: string; options: object };
export type TPluginHash = Record<string, object>;
