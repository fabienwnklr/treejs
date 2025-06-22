import { describe, expect, it } from 'vitest';
import { TreeJS } from '../src/TreeJS';
import type { TreeElement } from '../src/@types';

describe('TreeJS', () => {
  document.body.innerHTML = `
  <ul id="tree">
    <li id="first">
      First
      <ul>
        <li>First child</li>
        <li>Second child</li>
      </ul>
    </li>
  </ul>`;
  const Tree = new TreeJS('tree');
  const $tree = document.getElementById('tree') as TreeElement;

  it('Basic initialization', () => {
    expect(Tree).toBeInstanceOf(TreeJS);
    expect($tree.treejs).toBeInstanceOf(TreeJS);
    expect($tree.classList.contains('treejs-ul')).toBe(true);
  });

  it('Open and close nodes', () => {
    expect(Tree.getState('first')).toBe('closed');
    // Open with api
    Tree.toggle('first');
    expect(Tree.getState('first')).toBe('open');

    // Close with click
    const firstNode = $tree.querySelector('#first .treejs-anchor') as HTMLElement;
    firstNode!.click();
    expect(Tree.getState('first')).toBe('closed');
  });
});
