export declare type TreeJSOptions = {
  // checkbox: boolean;
  showPath: boolean;
  plugins: AvailablePlugins[];
  icons?: {
    folder?: string;
    file?: string;
  };
};
export declare type AvailablePlugins = 'context-menu' | 'checkbox' | 'drag-drop' | 'search' | 'sort' | 'filter';
export declare type TreeJSPlugin = {
  name: AvailablePlugins;
  options?: Record<string, any>;
};
