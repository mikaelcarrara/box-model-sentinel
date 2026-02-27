/**
 * Fixed Dimensions Generator
 * 
 * Generates ASCII visualizations for fixed width/height issues.
 * Shows BEFORE state with overflow and AFTER state with responsive solution.
 */

const BaseGenerator = require('./base-generator');
const { CHARS, EMOJI } = require('../core/character-palette');
const LayoutCalculator = require('../utils/layout-calculator');

/**
 * @typedef {import('../types').Issue} Issue
 * @typedef {import('../types').Visualization} Visualization
 */

/**
 * Generator for fixed-dimensions issue type
 */
class FixedDimensionsGenerator extends BaseGenerator {
  constructor(templateEngine) {
    super(templateEngine);
    this.calculator = new LayoutCalculator();
  }

  /**
   * Check if this generator supports the given issue type
   * 
   * @param {string} issueType - Issue type to check
   * @returns {boolean} True if supported
   */
  supports(issueType) {
    return issueType === 'fixed-dimensions';
  }

  /**
   * Generate visualization for fixed dimensions issue
   * 
   * @param {Issue} issue - Issue data
   * @returns {Visualization} Generated visualization
   */
  generate(issue) {
    // Parse the fixed width value
    const fixedWidth = this.calculator.parseValue(issue.value) || 600;
    const containerWidth = 400; // Assume viewport is smaller
    
    // BEFORE: Fixed width box with overflow
    const beforeContent = this.renderFixedBox(fixedWidth, containerWidth);
    
    // AFTER: Responsive width that fits
    const afterContent = this.renderResponsiveBox(containerWidth);
    
    // Generate standard visualization
    return this.generateStandardVisualization(
      issue,
      'Fixed Dimensions',
      beforeContent,
      afterContent
    );
  }

  /**
   * Render fixed width box showing overflow
   * 
   * @param {number} elementWidth - Element width in pixels
   * @param {number} containerWidth - Container width in pixels
   * @returns {string[]} Array of visualization lines
   */
  renderFixedBox(elementWidth, containerWidth) {
    const scale = 20; // Scale factor for visualization
    const boxWidth = Math.floor(elementWidth / scale);
    const viewportWidth = Math.floor(containerWidth / scale);
    
    const overflow = boxWidth > viewportWidth;
    const visibleWidth = Math.min(boxWidth, viewportWidth);
    const overflowWidth = overflow ? boxWidth - viewportWidth : 0;
    
    const lines = [];
    
    // Container border
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(viewportWidth) + CHARS.TOP_RIGHT);
    
    // Content with overflow indicator
    let contentLine = '  ' + CHARS.V_LINE + CHARS.SOLID.repeat(visibleWidth);
    if (overflow) {
      contentLine += CHARS.MEDIUM.repeat(Math.min(overflowWidth, 3)) + CHARS.RIGHT;
    } else {
      contentLine += CHARS.V_LINE;
    }
    lines.push(contentLine);
    
    // Container border
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(viewportWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }

  /**
   * Render responsive box that fits container
   * 
   * @param {number} containerWidth - Container width in pixels
   * @returns {string[]} Array of visualization lines
   */
  renderResponsiveBox(containerWidth) {
    const scale = 20;
    const boxWidth = Math.floor(containerWidth / scale);
    
    const lines = [];
    
    // Container border
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(boxWidth) + CHARS.TOP_RIGHT);
    
    // Content fits perfectly
    lines.push('  ' + CHARS.V_LINE + CHARS.SOLID.repeat(boxWidth) + CHARS.V_LINE);
    
    // Container border
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(boxWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }
}

module.exports = FixedDimensionsGenerator;
