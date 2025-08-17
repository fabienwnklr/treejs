export type ContextMenuOptions = {
  chooseFolderLabel?: boolean;
  chooseFolderId?: boolean;
  chooseFileLabel?: boolean;
  chooseFileId?: boolean;
};

declare module '@/TreeJS' {
  interface TreeJS extends ContextMenuPlugin {}
}


export interface ContextMenuPlugin {
  _folderMenu: (name: string) => void;
  _fileMenu: (name: string) => void;
  createFolder: (label: string, parent?: HTMLLIElement, id?: string) => void;
  _removeFolder: (event: Event) => void;
  _createFile: (event: Event) => void;
  _removeFile: (event: Event) => void;
  _bindContextMenuEvents: () => void;
}
