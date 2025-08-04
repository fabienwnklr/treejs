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

  it('should open context menu on right click and close on click outside', () => {
    const body = document.body;
    const firstItem = document.getElementById('first') as HTMLLIElement;
    firstItem.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    const contextMenu = document.querySelector('.treejs-contextmenu') as HTMLDivElement;
    // context menu should be visible
    expect(contextMenu).toBeDefined();
    expect(contextMenu.style.display).not.toBe('none');

    body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const contextMenuAfterClick = document.querySelector('.treejs-contextmenu') as HTMLDivElement;
    // context menu should be hidden
    expect(contextMenuAfterClick).toBeNull();
  });

  it('should show folder context menu on right click of a folder', () => {
    const firstItem = document.getElementById('first') as HTMLLIElement;
    firstItem.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    const contextMenu = document.querySelector('.treejs-contextmenu') as HTMLDivElement;
    // context menu should contain folder options
    expect(contextMenu.innerHTML).toContain('Create folder');
    expect(contextMenu.innerHTML).toContain('Create file');
    expect(contextMenu.innerHTML).toContain('Remove folder');
  });

  it('should show file context menu on right click of a file', () => {
    const firstChild = document.querySelector('#first ul li') as HTMLLIElement;
    firstChild.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    const contextMenu = document.querySelector('.treejs-contextmenu') as HTMLDivElement;
    // context menu should contain file options
    expect(contextMenu.innerHTML).toContain('Create folder');
    expect(contextMenu.innerHTML).toContain('Create file');
    expect(contextMenu.innerHTML).toContain('Remove file');
  });
});
