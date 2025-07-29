declare module '@/TreeJS' {
  interface TreeJS {
    // Checbox plugin methods
    _buildCheckboxes($liList: NodeListOf<HTMLLIElement>): void;
    toggleAllCheckboxes(checked: boolean): void;
    getCheckedCheckboxes(): CheckboxJSON;
    getChecked(): string[];
    toggleCheckbox(name: string): void;
  }
}

export interface TreeElement extends HTMLUListElement {
  treejs?: TreeJS;
}

export interface IEventEmitter {
  on(event: string, handler: (...args: any[]) => void): void;
  trigger(event: string, payload?: any): void;
  // Ajoute d'autres méthodes si besoin (off, once, etc.)
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

export type AvailablePlugins = 'context-menu' | 'checkbox' | 'drag-drop' | 'search' | 'sort' | 'filter';

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

export type TPlugins = {
  names: string[];
  settings: TSettings;
  requested: Record<string, boolean>;
  loaded: Record<string, object>;
  data: Record<string, any>;
};

export type TPluginItem = { name: string; options: object };
export type TPluginHash = Record<string, object>;
export type TCallback = (...args: any) => any;
