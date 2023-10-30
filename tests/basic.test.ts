import { describe, expect, it } from 'vitest';
import { TreeElement, TreeJS } from '../src/TreeJS';

describe('TreeJS', () => {
  document.body.innerHTML = `<ul id="tree"></ul>`;
  const Tree = new TreeJS('tree');

  it('Basic initialization', () => {
    const $tree = document.getElementById('tree') as TreeElement;
    expect(Tree).toBeInstanceOf(TreeJS);
    expect($tree.treejs).toBeInstanceOf(TreeJS);
    expect($tree.classList.contains('treejs')).toBe(true);
  });
});
