/**
 * Text Formatter Utility
 * 
 * Provides utilities for text padding, truncation, and visual length calculation.
 * Handles emoji width correctly for proper alignment in ASCII visualizations.
 */

const { CHARS } = require('../core/character-palette');

class TextFormatter {
  /**
   * Pad string to specified width with alignment
   * 
   * @param {string} text - Text to pad
   * @param {number} width - Target width in characters
   * @param {'left'|'center'|'right'} align - Alignment direction
   * @returns {string} Padded text
   */
  pad(text, width, align = 'left') {
    const textLength = this.visualLength(text);
    
    if (textLength >= width) {
      return this.truncate(text, width);
    }
    
    const padding = width - textLength;
    
    switch (align) {
      case 'center': {
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
      }
      case 'right':
        return ' '.repeat(padding) + text;
      default: // 'left'
        return text + ' '.repeat(padding);
    }
  }

  /**
   * Truncate text with ellipsis if it exceeds max length
   * 
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length in characters
   * @returns {string} Truncated text with ellipsis if needed
   */
  truncate(text, maxLength) {
    if (this.visualLength(text) <= maxLength) {
      return text;
    }
    
    // Account for ellipsis character
    const targetLength = maxLength - 1;
    let result = '';
    let currentLength = 0;
    
    for (const char of text) {
      const charLength = this.isEmoji(char) ? 2 : 1;
      if (currentLength + charLength > targetLength) {
        break;
      }
      result += char;
      currentLength += charLength;
    }
    
    return result + CHARS.ELLIPSIS;
  }

  /**
   * Calculate visual length of text (emojis count as 2)
   * 
   * @param {string} text - Text to measure
   * @returns {number} Visual length in character positions
   */
  visualLength(text) {
    if (!text) return 0;
    
    let length = 0;
    let i = 0;
    while (i < text.length) {
      const char = text[i];
      const codePoint = char.codePointAt(0);
      
      // Check if it's an emoji
      if (this.isEmoji(char)) {
        length += 2;
        // Skip variation selector if present (U+FE0F)
        if (i + 1 < text.length && text.charCodeAt(i + 1) === 0xFE0F) {
          i += 2;
        } else {
          i++;
        }
      } else {
        length += 1;
        i++;
      }
    }
    return length;
  }

  /**
   * Check if a character is an emoji
   * 
   * @param {string} char - Character to check
   * @returns {boolean} True if character is an emoji
   */
  isEmoji(char) {
    // Unicode ranges for emojis
    const codePoint = char.codePointAt(0);
    if (!codePoint) return false;
    
    return (
      (codePoint >= 0x1F300 && codePoint <= 0x1F9FF) || // Emoticons, symbols, pictographs
      (codePoint >= 0x2600 && codePoint <= 0x26FF) ||   // Miscellaneous symbols
      (codePoint >= 0x2700 && codePoint <= 0x27BF) ||   // Dingbats
      (codePoint >= 0x2139 && codePoint <= 0x2139) ||   // Information source (ℹ)
      (codePoint >= 0x2194 && codePoint <= 0x21AA)      // Arrows
    );
  }
}

module.exports = TextFormatter;
