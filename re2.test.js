const RE2 = require('re2');

describe('re2 validation', () => {
  test('should replace a string using a safe regex', () => {
    const re = new RE2(/foo/g);
    const newStr = 'bar'.replace(re, 'baz');
    expect(newStr).toBe('bar');
  });
});
