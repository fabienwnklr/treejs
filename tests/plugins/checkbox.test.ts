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

    const Tree = new TreeJS('tree', { plugins: ['checkbox'] });

    it('init', () => {
        expect(Tree.plugins.data.checked).toEqual({});
        expect(Tree.plugins.loaded.checkbox).not.toBeUndefined();
        expect(Tree.plugins.loaded.checkbox).toBeInstanceOf(Object);
    });

    it('toggleAllCheckboxes', () => {
        const $checkboxes = document.querySelectorAll('.treejs-checkbox');

        // Initially, all checkboxes should be unchecked
        $checkboxes.forEach(($checkbox) => {
            expect(($checkbox as HTMLInputElement).checked).toBe(false);
        });

        // Toggle all checkboxes to checked
        Tree.toggleAllCheckboxes(true);
        $checkboxes.forEach(($checkbox) => {
            expect(($checkbox as HTMLInputElement).checked).toBe(true);
        });

        // Toggle all checkboxes to unchecked
        Tree.toggleAllCheckboxes(false);
        $checkboxes.forEach(($checkbox) => {
            expect(($checkbox as HTMLInputElement).checked).toBe(false);
        });
    });

    it('toggleCheckbox', () => {
        const $firstCheckbox = document.querySelector('.treejs-checkbox[name="first"]') as HTMLInputElement;

        // Initially, the first checkbox should be unchecked
        expect($firstCheckbox.checked).toBe(false);

        // Toggle the first checkbox
        Tree.toggleCheckbox('first');
        expect($firstCheckbox.checked).toBe(true);

        // Toggle the first checkbox again
        Tree.toggleCheckbox('first');
        expect($firstCheckbox.checked).toBe(false);
    });
});
