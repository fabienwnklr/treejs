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
