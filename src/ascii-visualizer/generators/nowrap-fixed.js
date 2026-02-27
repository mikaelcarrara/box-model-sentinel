/**
 * Nowrap Fixed Generator
 * 
 * Generates ASCII visualizations for nowrap with fixed width issues.
 * Shows BEFORE state with text overflow and AFTER state with text wrapping.
 */

const BaseGenerator = require('./base-generator');
const { CHARS, EMOJI } = require('../core/character-palette');
const LayoutCalculator = require('../utils/layout-calculator');

/**
 * @typedef {import('../types').Issue} Issue
 * @typedef {import('../types').Visualization} Visualization
 */

/**
 * Generator for nowrap-fixed issue type
 */
class NowrapFixedGenerator extends BaseGenerator {
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
    return issueType === 'nowrap-fixed';
  }

  /**
   * Generate visualization for nowrap fixed issue
   * 
   * @param {Issue} issue - Issue data
   * @returns {Visualization} Generated visualization
   */
  generate(issue) {
    // BEFORE: Text overflow with nowrap
    const beforeContent = this.renderNowrapOverflow();
    
    // AFTER: Text wrapping
    const afterContent = this.renderWrappedText();
    
    // Generate standard visualization
    return this.generateStandardVisualization(
      issue,
      'Nowrap Fixed',
      beforeContent,
      afterContent
    );
  }

  /**
   * Render nowrap overflow visualization
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderNowrapOverflow() {
    const containerWidth = 16;
    const lines = [];
    
    // Container
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.TOP_RIGHT);
    
    // Text overflows (nowrap)
    let textLine = '  ' + CHARS.V_LINE;
    textLine += 'Long text conte';
    textLine += CHARS.ELLIPSIS + CHARS.RIGHT; // Overflow indicator
    lines.push(textLine);
    
    // Container
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }

  /**
   * Render wrapped text visualization
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderWrappedText() {
    const containerWidth = 16;
    const lines = [];
    
    // Container
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.TOP_RIGHT);
    
    // Text wraps to multiple lines
    lines.push('  ' + CHARS.V_LINE + 'Long text conte' + CHARS.V_LINE);
    lines.push('  ' + CHARS.V_LINE + 'nt wraps here  ' + CHARS.V_LINE);
    
    // Container
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }
}

module.exports = NowrapFixedGenerator;
