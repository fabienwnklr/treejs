import { describe, expect, it } from 'vitest';
import { TreeJS } from '@/TreeJS';

describe('Plugin - Context menu', () => {
  document.body.innerHTML = `
  <ul id="tree">
    <li id="first">
      First
      <ul>
        <li>First child</li>
        <li>Second child</li>
      </ul>
    </li>
    <li id="second">Second</li>
    <li id="third" data-treejs-fetch-url="https://gist.githack.com/fabienwnklr/4561e87ad6c94070544470a7bf930a8d/raw/144478e6210a8a87df4ce48ebc099f4b09a4a332/treejs.json">
      Third
  </ul>`;

  const Tree = new TreeJS('tree', { plugins: ['context-menu'] });

  it('should initialize the context menu plugin', () => {
    expect(Tree.plugins.loaded['context-menu']).toBeDefined();
  });
});
