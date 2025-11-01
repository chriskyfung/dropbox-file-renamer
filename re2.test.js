const RE2 = require('re2');

describe('re2 validation', () => {
  test('should not replace a non-matching string', () => {
    const re = new RE2(/foo/g);
    const newStr = 'bar'.replace(re, 'baz');
    expect(newStr).toBe('bar');
  });

  test('should replace a matching string', () => {
    const re = new RE2(/foo/g);
    const newStr = 'foo bar foo'.replace(re, 'baz');
    expect(newStr).toBe('baz bar baz');
  });
});
