import { TreeJS } from '../../TreeJS';
import { createCheckbox, findNodeByType } from '../../utils/dom';
// import { ... } from '../../utils/dom'
import { _getLiName, deepMerge } from '../../utils/functions';
import type { myType } from './@types';

// importing style
import './plugin.scss';

/**
 * @name Template
 * Description of plugin
 * @param this
 * @param opts
 */
export default function (this: TreeJS, opts: myType = {}) {
  const defaultOpts: myType = { prop1: '' };
  opts = deepMerge<myType>(opts, defaultOpts);

  this.on('init', () => {
    if (this.$liList) {
      this.$liList.forEach(($li) => {
        const $child = $li.querySelector('ul');
        let $checkbox: HTMLInputElement | null = null;
        const anchorWrapper = findNodeByType($li.childNodes, 'span') as HTMLSpanElement;
        if (!anchorWrapper || !anchorWrapper.textContent) return;
        const name = _getLiName($li, anchorWrapper);
        $checkbox = createCheckbox(name);
        anchorWrapper.prepend($checkbox);

        const checked: Record<string, boolean> = {};
        const $a = $checkbox;
        $checkbox.addEventListener('change', () => {
          checked[$a.name] = $a.checked;
          if ($child) {
            $child.querySelectorAll('input').forEach(($input) => {
              $input.checked = $a.checked;
              checked[$input.name] = $a.checked;
            });
          }

          this.plugins.data.checked = checked;

          this.trigger('checkbox-change', {
            checked: $a.checked,
            target: $li,
          });
        });
      });
    }
  });
}
