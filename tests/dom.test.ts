import { describe, expect, it } from 'vitest';
import { createCheckbox, findNodeByType,  JSONToHTMLElement, stringToHTMLElement } from '@utils/dom';

describe('DOM Utils', () => {
  it('findNodeByType', () => {
    const ul = document.createElement('ul');
    const li = document.createElement('li');
    ul.appendChild(li);
    expect(findNodeByType(ul.childNodes, 'li')).toEqual(li);
  });

  it('createCheckbox', () => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'test';
    checkbox.classList.add('treejs-checkbox');
    expect(createCheckbox('test', 'treejs-')).toEqual(checkbox);
    expect(createCheckbox('test', 'treejs-').classList.contains('treejs-checkbox')).toBe(true);
  });

  it('stringToHTMLElement', () => {
    const string = '<div></div>';
    const element = document.createElement('div');
    expect(stringToHTMLElement<HTMLDivElement>(string)).toEqual(element);

    const string2 = '<h1 class="test"></h1>';
    const element2 = document.createElement('h1');
    element2.classList.add('test');
    expect(stringToHTMLElement<HTMLDivElement>(string2)).toEqual(element2);
  });

  it('JSONToHTMLElement', () => {
    const data = { label: 'test', children: [] };
    const element = document.createElement('li');
    element.innerHTML = 'test';
    expect(JSONToHTMLElement(data)).toEqual(element);

    // more complexe json
    const data2 = { label: 'test', children: [{ label: 'test2', children: [] }] };
    const element2 = document.createElement('li');
    element2.innerHTML = 'test';
    const ul = document.createElement('ul');
    const li = document.createElement('li');
    li.innerHTML = 'test2';
    ul.appendChild(li);
    element2.appendChild(ul);
    expect(JSONToHTMLElement(data2)).toEqual(element2);
  });

//   it('getHiddenElementHeight', () => {
//     const element = stringToHTMLElement<HTMLDivElement>('<div style="display: none;height: 100px">Content</div>');
//     expect(getHiddenElementHeight(element)).toBe(100);
//   });
});
