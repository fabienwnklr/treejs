declare module '@/TreeJS' {
  interface TreeJS extends DialogPlugin {}
}

export type DialogOptions = {
  /**
   * @default 'center'
   */
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
};

export type UniqueDialogOptions = {
  title: false | string;
  id: string;
  autoOpen: boolean;
  footer: false | string;
};

export type Field = {
  name: string;
  label: string;
};

export interface DialogPlugin {
  _dialogs: HTMLDialogElement[];
  createDialog(content: string, options?: Partial<UniqueDialogOptions>): HTMLDialogElement;
  createPrompt<T>(
    fields: Field[],
    title?: string
  ): Promise<null | T>;
  openDialog(id: string): void;
  closeDialog(id: string): void;
  setDialogContent(content: string): void;
}

declare module '@/@types' {
  interface TreeJSEvents {
    'dialog-open': (payload: { id: string; $dialog: HTMLDialogElement }) => void;
    'dialog-close': (payload: { $dialog: HTMLDialogElement; result: string | undefined }) => void;
    'dialog-content-set': (payload: {
      /**
       * The new content of the dialog.
       */
      content: string;
    }) => void;
  }
}
