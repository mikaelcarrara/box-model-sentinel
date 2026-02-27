/**
 * Tests for LayoutCalculator utility
 */

const LayoutCalculator = require('../utils/layout-calculator');

describe('LayoutCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new LayoutCalculator();
  });

  describe('scaleToChars', () => {
    test('scales pixels to characters proportionally', () => {
      expect(calculator.scaleToChars(600, 20, 1200)).toBe(10);
      expect(calculator.scaleToChars(1200, 20, 1200)).toBe(20);
      expect(calculator.scaleToChars(300, 20, 1200)).toBe(5);
    });

    test('handles edge cases', () => {
      expect(calculator.scaleToChars(0, 20, 1200)).toBe(0);
      expect(calculator.scaleToChars(1, 20, 1200)).toBe(0); // Rounds down
    });
  });

  describe('calculateProportions', () => {
    test('calculates proportions without overflow', () => {
      const result = calculator.calculateProportions(400, 800, 20);
      
      expect(result.width).toBe(10);
      expect(result.height).toBe(3);
      expect(result.overflow).toBe(false);
    });

    test('detects overflow', () => {
      const result = calculator.calculateProportions(1000, 800, 20);
      
      expect(result.width).toBe(20); // Capped at maxChars
      expect(result.overflow).toBe(true);
    });

    test('handles exact fit', () => {
      const result = calculator.calculateProportions(800, 800, 20);
      
      expect(result.width).toBe(20);
      expect(result.overflow).toBe(false);
    });
  });

  describe('parseValue', () => {
    test('parses pixel values', () => {
      expect(calculator.parseValue('600px')).toBe(600);
      expect(calculator.parseValue('100px')).toBe(100);
      expect(calculator.parseValue('0px')).toBe(0);
    });

    test('parses viewport width values', () => {
      expect(calculator.parseValue('50vw')).toBe(960); // 50% of 1920
      expect(calculator.parseValue('100vw')).toBe(1920);
      expect(calculator.parseValue('25vw')).toBe(480);
    });

    test('parses percentage values', () => {
      expect(calculator.parseValue('50%')).toBe(600); // 50% of 1200
      expect(calculator.parseValue('100%')).toBe(1200);
      expect(calculator.parseValue('25%')).toBe(300);
    });

    test('handles invalid values', () => {
      expect(calculator.parseValue('invalid')).toBeNull();
      expect(calculator.parseValue('')).toBeNull();
      expect(calculator.parseValue(null)).toBeNull();
      expect(calculator.parseValue(undefined)).toBeNull();
    });

    test('handles decimal values', () => {
      expect(calculator.parseValue('100.5px')).toBe(100.5);
      expect(calculator.parseValue('50.5vw')).toBe(969.6);
    });
  });
});
