export declare type myType = {
  prop1?: any;
};

declare module '@/TreeJS' {
  interface TreeJS extends ContextMenuPlugin {}
}


export interface ContextMenuPlugin {
  _folderMenu: () => void;
  _fileMenu: () => void;
}
