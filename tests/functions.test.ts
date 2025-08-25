import { describe, expect, it } from 'vitest';
import {
  _getLiName,
  getAttributes,
  isObject,
  validateAttributes,
  isValidOptions,
  sanitizeString,
} from '@/utils/functions';

describe('Unit tests', () => {
  it('isObject', () => {
    expect(isObject({})).toBe(true);
  });

  it('sanitizeString', () => {
    expect(sanitizeString('Hello, World!')).toBe('hello_world');
    expect(sanitizeString(' Hello ')).toBe('hello');
    expect(sanitizeString('Hey, 10$ à 20$')).toBe('hey_10_20');
  });

  it('_getLiName', () => {
    const $li = document.createElement('li');
    $li.dataset.treejsName = 'test';
    expect(sanitizeString(_getLiName($li))).toBe('test');
  });

  it('isValidOptions', () => {
    const options = { a: 1, b: 2, c: 3 };
    const defaults = { a: 1, b: 2, c: 3, d: 4 };
    expect(isValidOptions(options, defaults)).toBe(true);

    const options2 = { a: 1, b: 2, c: 3, e: 4 };
    expect(isValidOptions(options2, defaults)).toBe(false);
  });

  it('getAttributes', () => {
    const $el = document.createElement('div');
    $el.setAttribute('data-test-first', '1');
    $el.setAttribute('data-test-second', '2');
    const attributes = getAttributes('data-test', $el);
    expect(attributes).toEqual({ first: '1', second: '2' });
  });

  it('validateAttributes', () => {
    const attributes = { first: '1' };
    const attributesList = [{ name: 'first', type: 'string', description: 'First attribute' }];
    expect(validateAttributes(attributes, attributesList)).toBe(true);

    const attributes2 = { first: '1', second: '2' };
    expect(validateAttributes(attributes2, attributesList)).toBe(false);
  });
});
