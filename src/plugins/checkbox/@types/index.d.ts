declare module '@/TreeJS' {
  interface TreeJS extends CheckboxPlugin {}
}

export interface CheckboxPlugin {
  getChecked(): string[];
  toggleAllCheckboxes(checked: boolean): void;
  toggleCheckbox(name: string): void;
  setChecked(name: string, checked: boolean): void;
  _buildCheckboxes($liList: NodeListOf<HTMLLIElement>, $parent?: HTMLLIElement): void;
  getCheckedCheckboxes(): CheckboxJSON;
}

export type CheckboxOptions = object;
export type CheckboxJSON = {
  [key: string]: {
    name: string;
    value: string;
    checked?: boolean;
  };
};

declare module '@/@types' {
  interface TreeJSEvents {
    'checkbox-change': (payload: {
      /**
       * Whether the checkbox is checked or not.
       */
      checked: boolean;
      /**
       * Whether the checkbox has child checkboxes.
       */
      hasChild: boolean;
      /**
       * The name of the checkbox.
       */
      name: string;
      /**
       * The target HTMLInputElement of the checkbox.
       */
      target: HTMLInputElement;
    }) => void;
  }
}
