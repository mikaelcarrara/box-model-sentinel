/**
 * Layout Calculator Utility
 * 
 * Provides utilities for scaling pixel values to character counts,
 * calculating proportional dimensions, and parsing CSS values.
 */

/**
 * @typedef {Object} ScaledDimensions
 * @property {number} width - Scaled width in characters
 * @property {number} height - Scaled height in lines
 * @property {number} scale - Scale factor used
 * @property {boolean} overflow - Whether element overflows container
 */

class LayoutCalculator {
  /**
   * Scale pixel values to character counts
   * 
   * @param {number} pixels - Pixel value to scale
   * @param {number} maxChars - Maximum characters available
   * @param {number} maxPixels - Maximum pixel value (reference)
   * @returns {number} Scaled character count
   */
  scaleToChars(pixels, maxChars, maxPixels) {
    const ratio = pixels / maxPixels;
    return Math.floor(ratio * maxChars);
  }

  /**
   * Calculate proportional dimensions for visualization
   * 
   * @param {number} elementSize - Element size in pixels
   * @param {number} containerSize - Container size in pixels
   * @param {number} maxChars - Maximum characters for visualization
   * @returns {ScaledDimensions} Scaled dimensions with overflow info
   */
  calculateProportions(elementSize, containerSize, maxChars) {
    const scale = maxChars / containerSize;
    const scaledElement = Math.floor(elementSize * scale);
    const scaledContainer = maxChars;
    
    return {
      width: Math.min(scaledElement, scaledContainer),
      height: 3, // Standard box height
      scale,
      overflow: scaledElement > scaledContainer,
    };
  }

  /**
   * Parse CSS value to pixels
   * 
   * Supports: px, vw, % units
   * Assumes: 1920px viewport for vw, 1200px container for %
   * 
   * @param {string} value - CSS value string (e.g., "600px", "50vw", "100%")
   * @returns {number|null} Pixel value or null if parsing fails
   */
  parseValue(value) {
    if (!value || typeof value !== 'string') {
      return null;
    }

    // Handle px
    const pxMatch = value.match(/^(\d+(?:\.\d+)?)px$/);
    if (pxMatch) {
      return parseFloat(pxMatch[1]);
    }

    // Handle vw (assume 1920px viewport)
    const vwMatch = value.match(/^(\d+(?:\.\d+)?)vw$/);
    if (vwMatch) {
      return (parseFloat(vwMatch[1]) / 100) * 1920;
    }

    // Handle % (relative to container, assume 1200px)
    const pctMatch = value.match(/^(\d+(?:\.\d+)?)%$/);
    if (pctMatch) {
      return (parseFloat(pctMatch[1]) / 100) * 1200;
    }

    return null;
  }
}

module.exports = LayoutCalculator;
