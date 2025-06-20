import { describe, expect, it } from 'vitest';
import { TreeJS } from '../src/TreeJS';
import type { TreeElement } from '../src/@types';

describe('TreeJS', () => {
  document.body.innerHTML = `<ul id="tree"></ul>`;
  const Tree = new TreeJS('tree');

  it('Basic initialization', () => {
    const $tree = document.getElementById('tree') as TreeElement;
    expect(Tree).toBeInstanceOf(TreeJS);
    expect($tree.treejs).toBeInstanceOf(TreeJS);
    expect($tree.classList.contains('treejs-ul')).toBe(true);
  });
});
