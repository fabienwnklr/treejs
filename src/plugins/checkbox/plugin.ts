import { TreeJS } from '@/TreeJS';
import { createCheckbox } from '@/utils/dom';
// import { ... } from '@/utils/dom'
import { _getLiName, deepMerge } from '@/utils/functions';
import type { CheckboxJSON, CheckboxOptions } from './@types';

// importing style
import './plugin.scss';

/**
 * @name Checkbox
 * @description Adds checkboxes to the tree nodes.
 * @version 1.0.0
 * @author Your Name
 * @param {TreeJS} this - The TreeJS instance
 * @param {CheckboxOptions} [opts={}] - Plugin options
 */
export default function (this: TreeJS, opts: CheckboxOptions = {}) {
  const defaultOpts: CheckboxOptions = {};
  opts = deepMerge<CheckboxOptions>(opts, defaultOpts);

  this.on('initialize', () => {
    if (this.$liList) {
      this.plugins.data.checked = this.plugins.data.checked || {};
      this._buildCheckboxes(this.$liList);
    }
  });

  this._buildCheckboxes = ($list: NodeListOf<HTMLLIElement>, $parent?: HTMLLIElement) => {
    if (!$list || !$list.length) return;

    let parentChecked = false;
    if ($parent) {
      // check if parent checked
      parentChecked = $parent.querySelector<HTMLInputElement>(`.${this._prefix}checkbox:first-child`)?.checked || false;
    }
    $list.forEach(($li) => {
      const $child = $li.querySelector('ul');
      let $checkbox: HTMLInputElement | null = null;
      const anchorWrapper = $li.querySelector(`.${this._anchor_class}`);
      if (!anchorWrapper || !anchorWrapper.textContent) return;
      $li.classList.add(`${this._li_class}--checkbox`);
      const name = _getLiName($li, anchorWrapper);
      $checkbox = createCheckbox(name, this._prefix, parentChecked);
      anchorWrapper.prepend($checkbox);

      const checked: CheckboxJSON = {};
      const $a = $checkbox;
      $checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      $checkbox.addEventListener('change', () => {
        checked[$a.name] = { checked: $a.checked, name: $a.name, value: $a.value };
        if ($child) {
          $child.querySelectorAll('input').forEach(($input) => {
            $input.checked = $a.checked;
            checked[$input.name] = { checked: $input.checked, name: $input.name, value: $input.value };
          });
        }

        this.plugins.data.checked = { ...this.plugins.data.checked, ...checked };

        this.trigger('checkbox-change', {
          checked: $a.checked,
          hasChild: !!$child,
          name: $a.name,
          target: $a,
        });
      });
    });
  };

  /**
   * Get the object containing the checked nodes.
   * @returns {CheckboxJSON} An object where keys are node names and values are their values.
   */
  this.getCheckedCheckboxes = (): CheckboxJSON => {
    return this.plugins.data.checked ?? [];
  };

  /**
   * Toggle the checkbox for a specific node.
   * @param {string} name - The name of the node to toggle.
   * @returns {void}
   */
  this.toggleCheckbox = (name: string): void => {
    const $checkbox = this.$list.querySelector(`.${this._prefix}checkbox[name="${name}"]`);
    if ($checkbox && $checkbox instanceof HTMLInputElement) {
      $checkbox.checked = !$checkbox.checked;
      $checkbox.dispatchEvent(new Event('change'));
    }
  };

  /**
   * Toggle all checkboxes in the tree.
   * @param {boolean} [checked=true] - Whether to check or uncheck all checkboxes.
   * @returns {void}
   */
  this.toggleAllCheckboxes = (checked: boolean = true): void => {
    const $checkboxes = this.$list.querySelectorAll(`.${this._prefix}checkbox`);
    $checkboxes.forEach(($checkbox) => {
      if ($checkbox instanceof HTMLInputElement) {
        $checkbox.checked = checked;
        $checkbox.dispatchEvent(new Event('change'));
      }
    });
  };

  return {
    _buildCheckboxes: this._buildCheckboxes,
    getCheckedCheckboxes: this.getCheckedCheckboxes,
    name: 'checkbox',
    options: opts,
    toggleAllCheckboxes: this.toggleAllCheckboxes,
    toggleCheckbox: this.toggleCheckbox,
  };
}
