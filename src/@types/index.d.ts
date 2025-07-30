import { CheckboxPlugin } from "@/plugins/checkbox/@types";

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

export type AvailablePlugins =
  | "context-menu"
  | "checkbox"
  | "drag-drop"
  | "search"
  | "sort"
  | "filter";

export interface TreeJSPlugin {
  name: AvailablePlugins;
  options?: Record<string, any>;
}

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
}

export type TreeJSEvents = {
  initialize: (payload: { target: HTMLElement }) => void;
  select: (payload: { name: string; target: HTMLElement }) => void;
  open: (payload: { name: string; target: HTMLElement }) => void;
  close: (payload: { name: string; target: HTMLElement }) => void;
  fetch: (payload: { name: string; target: HTMLElement; uri: string }) => void;
  fetched: (payload: {
    name: string;
    response: Response;
    target: HTMLElement;
  }) => void;
  "fetch-error": (payload: {
    error: any;
    name: string;
    target: HTMLElement;
    uri: string;
  }) => void;
};

export type TPlugins = {
  names: string[];
  settings: TSettings;
  requested: Record<string, boolean>;
  loaded: { [K in keyof PluginTypes]?: PluginTypes[K] };
  data: Record<string, any>;
};

export type TPluginItem = { name: string; options: object };
export type TPluginHash = Record<string, object>;
export type TCallback = (...args: any) => any;

export interface IEventEmitter {
  on(events: string, fct: TCallback): void;
  off(events: string, fct: TCallback): void;
  trigger(events: string, ...args: any): void;
}
