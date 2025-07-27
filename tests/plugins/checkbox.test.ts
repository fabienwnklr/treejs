import { describe, expect, it, vi } from 'vitest';
import { TreeJS } from '../../src/TreeJS';

describe('Plugin - Checkbox', () => {
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
    <li id="third" data-treejs-fetch-url="https://example.com/data.json">
      Third
  </ul>`;

    it('should initialize with default options', () => {
        const tree = new TreeJS('tree', { plugins: ['checkbox'] });
        expect(tree.plugins.data.checked).toEqual({});
        expect(tree.plugins.loaded.checkbox).not.toBeUndefined();
        expect(tree.plugins.loaded.checkbox).toBeInstanceOf(Object);
    });
});
