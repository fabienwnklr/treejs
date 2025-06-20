export interface TreeJSOptions {
  // checkbox: boolean;
  showPath: boolean;
  plugins: AvailablePlugins[];
  icons?: {
    folder?: string;
    file?: string;
  };
}

export type AvailablePlugins = 'context-menu' | 'checkbox' | 'drag-drop' | 'search' | 'sort' | 'filter';

export interface TreeJSPlugin {
  name: AvailablePlugins;
  options?: Record<string, any>;
}

export interface TreeJSJSON {
  label: string;
  children: TreeJSJSON[];
  [key: string]: any;
}
