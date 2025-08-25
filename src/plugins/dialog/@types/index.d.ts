declare module '@/TreeJS' {
  interface TreeJS extends DialogPlugin {}
}

export type DialogOptions = {
  /**
   * @default 'center'
   */
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
};

export interface DialogPlugin {
  _dialogs: HTMLDialogElement[];
  createDialog(content: string, id?: string, autoOpen?: boolean): void;
  openDialog(id: string): void;
  closeDialog(id: string): void;
  setDialogContent(content: string): void;
}

declare module '@/@types' {
  interface TreeJSEvents {
    'dialog-open': (payload: {
      /**
       * The options used to open the dialog.
       */
      options: DialogOptions;
    }) => void;
    'dialog-close': () => void;
    'dialog-content-set': (payload: {
      /**
       * The new content of the dialog.
       */
      content: string;
    }) => void;
  }
}
