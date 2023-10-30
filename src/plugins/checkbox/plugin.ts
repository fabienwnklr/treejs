import { TreeJS } from '../../TreeJS';
import { createCheckbox, findNodeByType } from '../../utils/dom';
// import { ... } from '../../utils/dom'
import { deepMerge } from '../../utils/functions';
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

  console.log(opts);
  this.on('init', () => {
    console.log("checkboxplugin")
    if (this.$liList) {
      this.$liList.forEach(($li) => {
        const $child = $li.querySelector('ul');
        let $checkbox: HTMLInputElement | null = null;
        const anchor = findNodeByType($li.childNodes, 'a') as HTMLAnchorElement;
        if (!anchor || !anchor.textContent) return;
        const name = $li.dataset.treejsName ?? anchor.textContent.trim().replace(/\W/g, '_').toLowerCase();
        $checkbox = createCheckbox(name);
        anchor.before($checkbox);

        const $a = $checkbox;
        $checkbox.addEventListener('change', () => {
          if ($child) {
            $child.querySelectorAll('input').forEach(($input) => {
              $input.checked = $a.checked;
            });
          }
        });
      });
    }
  });
}
