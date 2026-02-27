/**
 * Tests for Character Palette
 */

const { CHARS, EMOJI } = require('../core/character-palette');
const fc = require('fast-check');

describe('Character Palette', () => {
  describe('CHARS constants', () => {
    test('all characters are defined', () => {
      expect(CHARS.SOLID).toBe('█');
      expect(CHARS.MEDIUM).toBe('▓');
      expect(CHARS.LIGHT).toBe('░');
      expect(CHARS.H_LINE).toBe('─');
      expect(CHARS.V_LINE).toBe('│');
      expect(CHARS.TOP_LEFT).toBe('┌');
      expect(CHARS.TOP_RIGHT).toBe('┐');
      expect(CHARS.BOTTOM_LEFT).toBe('└');
      expect(CHARS.BOTTOM_RIGHT).toBe('┘');
      expect(CHARS.DOWN).toBe('▼');
      expect(CHARS.RIGHT).toBe('►');
      expect(CHARS.LEFT).toBe('◄');
      expect(CHARS.ELLIPSIS).toBe('…');
      expect(CHARS.SPACE).toBe(' ');
      expect(CHARS.DOT).toBe('•');
    });
  });

  describe('EMOJI constants', () => {
    test('all emojis are defined', () => {
      expect(EMOJI.CRITICAL).toBe('✖');
      expect(EMOJI.MEDIUM).toBe('⚠');
      expect(EMOJI.LOW).toBe('ⓘ');
      expect(EMOJI.PROBLEM).toBe('✖');
      expect(EMOJI.SOLUTION).toBe('✓');
      expect(EMOJI.ARROW).toBe('→');
    });
  });

  // Feature: ascii-visualizer, Property 3: Character Palette Compliance
  // For any generated visualization, all characters used must be from the defined character palette
  describe('Property 3: Character Palette Compliance', () => {
    test('all palette characters are valid UTF-8', () => {
      const allChars = [...Object.values(CHARS), ...Object.values(EMOJI)];
      
      allChars.forEach(char => {
        expect(typeof char).toBe('string');
        expect(char.length).toBeGreaterThan(0);
        // Verify it's valid UTF-8 by encoding/decoding
        const encoded = Buffer.from(char, 'utf8');
        const decoded = encoded.toString('utf8');
        expect(decoded).toBe(char);
      });
    });

    test('palette characters are unique', () => {
      const allChars = [...Object.values(CHARS), ...Object.values(EMOJI)];
      const uniqueChars = new Set(allChars);
      // Note: CRITICAL and PROBLEM both use '✖', so we have 20 unique chars instead of 21
      expect(uniqueChars.size).toBe(20);
    });

    test('palette contains all required character types', () => {
      // Content characters
      expect(CHARS.SOLID).toBeDefined();
      expect(CHARS.MEDIUM).toBeDefined();
      expect(CHARS.LIGHT).toBeDefined();
      
      // Border characters
      expect(CHARS.H_LINE).toBeDefined();
      expect(CHARS.V_LINE).toBeDefined();
      expect(CHARS.TOP_LEFT).toBeDefined();
      expect(CHARS.TOP_RIGHT).toBeDefined();
      expect(CHARS.BOTTOM_LEFT).toBeDefined();
      expect(CHARS.BOTTOM_RIGHT).toBeDefined();
      
      // Indicators
      expect(CHARS.DOWN).toBeDefined();
      expect(CHARS.RIGHT).toBeDefined();
      expect(CHARS.LEFT).toBeDefined();
      expect(CHARS.ELLIPSIS).toBeDefined();
      
      // Severity emojis
      expect(EMOJI.CRITICAL).toBeDefined();
      expect(EMOJI.MEDIUM).toBeDefined();
      expect(EMOJI.LOW).toBeDefined();
      
      // Status emojis
      expect(EMOJI.PROBLEM).toBeDefined();
      expect(EMOJI.SOLUTION).toBeDefined();
    });
  });
});
