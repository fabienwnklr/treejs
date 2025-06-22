import { describe, expect, it, vi } from 'vitest';
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
    <li id="second">Second</li>
    <li id="third" data-treejs-fetch-url="https://example.com/data.json">
      Third
  </ul>`;

  const Tree = new TreeJS('tree');
  const $tree = document.getElementById('tree') as TreeElement;

  it('Basic initialization', () => {
    expect(Tree).toBeInstanceOf(TreeJS);
    expect($tree.treejs).toBeInstanceOf(TreeJS);
    expect($tree.classList.contains('treejs-ul')).toBe(true);
  });

  it('Toggle nodes', () => {
    expect(Tree.getState('first')).toBe('closed');
    // With api
    Tree.toggle('first');
    expect(Tree.getState('first')).toBe('open');
    Tree.toggle('first');
    expect(Tree.getState('first')).toBe('closed');

    // With click
    const firstNode = $tree.querySelector('#first .treejs-anchor') as HTMLElement;
    firstNode.click();
    expect(Tree.getState('first')).toBe('open');
    firstNode.click();
    expect(Tree.getState('first')).toBe('closed');
  });

  it('Event listeners', () => {
    const onOpen = vi.fn(({ name, target }) => {
      // console.log(`Node ${name} is open`, target);
    });
    const onClose = vi.fn(({ name, target }) => {
      // console.log(`Node ${name} is closed`, target);
    });
    const onSelect = vi.fn(({ name, target }) => {
      console.log(`Node ${name} selected`, target);
    });

    Tree.on('open', onOpen);
    Tree.on('close', onClose);
    Tree.on('select', onSelect);

    // Trigger open event
    const firstNode = $tree.querySelector('#first .treejs-anchor') as HTMLElement;
    firstNode.click();
    expect(onOpen).toHaveBeenCalledWith({ name: 'first', target: document.getElementById('first') });

    // Trigger close event
    firstNode.click();
    expect(onClose).toHaveBeenCalledWith({ name: 'first', target: document.getElementById('first') });

    // Trigger select event
    const secondNode = $tree.querySelector('#second .treejs-anchor') as HTMLElement;
    secondNode.click();
    expect(onSelect).toHaveBeenCalledWith({ name: 'second', target: document.getElementById('second') });
  });

  it('Get and set state', () => {
    expect(Tree.getState('first')).toBe('closed');
    Tree.open('first');
    expect(Tree.getState('first')).toBe('open');
    Tree.close('first');
    expect(Tree.getState('first')).toBe('closed');
  });

  it('Load data from url', async () => {

  })
});
