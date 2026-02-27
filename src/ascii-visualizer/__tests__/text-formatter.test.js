/**
 * Tests for TextFormatter utility
 */

const TextFormatter = require('../utils/text-formatter');

describe('TextFormatter', () => {
  let formatter;

  beforeEach(() => {
    formatter = new TextFormatter();
  });

  describe('pad', () => {
    test('pads text on the right (left align)', () => {
      expect(formatter.pad('hello', 10, 'left')).toBe('hello     ');
      expect(formatter.pad('test', 8, 'left')).toBe('test    ');
    });

    test('pads text on the left (right align)', () => {
      expect(formatter.pad('hello', 10, 'right')).toBe('     hello');
      expect(formatter.pad('test', 8, 'right')).toBe('    test');
    });

    test('centers text', () => {
      expect(formatter.pad('hello', 11, 'center')).toBe('   hello   ');
      expect(formatter.pad('test', 10, 'center')).toBe('   test   ');
    });

    test('truncates text that exceeds width', () => {
      const result = formatter.pad('very long text', 8, 'left');
      expect(result.length).toBeLessThanOrEqual(8);
      expect(result).toContain('…');
    });

    test('handles empty string', () => {
      expect(formatter.pad('', 5, 'left')).toBe('     ');
    });
  });

  describe('truncate', () => {
    test('truncates long text with ellipsis', () => {
      const result = formatter.truncate('this is a very long text', 10);
      expect(result.length).toBeLessThanOrEqual(10);
      expect(result).toContain('…');
    });

    test('does not truncate short text', () => {
      expect(formatter.truncate('short', 10)).toBe('short');
    });

    test('handles exact length', () => {
      const text = 'exactly10!';
      expect(formatter.truncate(text, 10)).toBe(text);
    });
  });

  describe('visualLength', () => {
    test('calculates length of regular text', () => {
      expect(formatter.visualLength('hello')).toBe(5);
      expect(formatter.visualLength('test')).toBe(4);
    });

    test('counts emojis as 2 characters', () => {
      expect(formatter.visualLength('🚫')).toBe(2);
      expect(formatter.visualLength('⚠️')).toBe(2);
      expect(formatter.visualLength('hello 🚫')).toBe(8); // 5 + 1 space + 2
    });

    test('handles empty string', () => {
      expect(formatter.visualLength('')).toBe(0);
    });

    test('handles null/undefined', () => {
      expect(formatter.visualLength(null)).toBe(0);
      expect(formatter.visualLength(undefined)).toBe(0);
    });
  });

  describe('isEmoji', () => {
    test('identifies emojis', () => {
      expect(formatter.isEmoji('🚫')).toBe(true);
      expect(formatter.isEmoji('⚠️')).toBe(true);
      expect(formatter.isEmoji('ℹ️')).toBe(true);
      expect(formatter.isEmoji('❌')).toBe(true);
      expect(formatter.isEmoji('✅')).toBe(true);
    });

    test('identifies non-emojis', () => {
      expect(formatter.isEmoji('a')).toBe(false);
      expect(formatter.isEmoji('1')).toBe(false);
      expect(formatter.isEmoji(' ')).toBe(false);
      expect(formatter.isEmoji('█')).toBe(false);
    });
  });
});
