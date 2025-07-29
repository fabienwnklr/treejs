declare module '@/TreeJS' {
  interface TreeJS extends CheckboxPlugin {}
}

export interface CheckboxPlugin {
  getChecked(): string[];
  toggleAllCheckboxes(checked: boolean): void;
  toggleCheckbox(name: string): void;
  setChecked(name: string, checked: boolean): void;
  _buildCheckboxes($liList: NodeListOf<HTMLLIElement>): void;
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
