/**
 * Overflow Masking Generator
 * 
 * Generates ASCII visualizations for body overflow masking issues.
 * Shows BEFORE state with hidden overflow and AFTER state with visible content.
 */

const BaseGenerator = require('./base-generator');
const { CHARS, EMOJI } = require('../core/character-palette');
const LayoutCalculator = require('../utils/layout-calculator');

/**
 * @typedef {import('../types').Issue} Issue
 * @typedef {import('../types').Visualization} Visualization
 */

/**
 * Generator for overflow-masking issue type
 */
class OverflowMaskingGenerator extends BaseGenerator {
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
    return issueType === 'overflow-masking';
  }

  /**
   * Generate visualization for overflow masking issue
   * 
   * @param {Issue} issue - Issue data
   * @returns {Visualization} Generated visualization
   */
  generate(issue) {
    // BEFORE: Show hidden overflow
    const beforeContent = this.renderMaskedOverflow();
    
    // AFTER: Show visible overflow
    const afterContent = this.renderVisibleOverflow();
    
    // Generate standard visualization
    return this.generateStandardVisualization(
      issue,
      'Overflow Masking',
      beforeContent,
      afterContent
    );
  }

  /**
   * Render masked overflow (content hidden)
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderMaskedOverflow() {
    const vpWidth = 20;
    const lines = [];
    
    // Body container
    lines.push('  body {');
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(vpWidth) + CHARS.TOP_RIGHT);
    
    // Visible content
    lines.push('  ' + CHARS.V_LINE + CHARS.SOLID.repeat(vpWidth) + CHARS.V_LINE);
    
    // Hidden content indicator (cut off)
    lines.push('  ' + CHARS.V_LINE + CHARS.LIGHT.repeat(vpWidth) + CHARS.ELLIPSIS + ' hidden');
    
    // Body border
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(vpWidth) + CHARS.BOTTOM_RIGHT);
    lines.push('  }');
    
    return lines;
  }

  /**
   * Render visible overflow (content shown)
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderVisibleOverflow() {
    const vpWidth = 20;
    const lines = [];
    
    // Body container
    lines.push('  body {');
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(vpWidth) + CHARS.TOP_RIGHT);
    
    // Visible content
    lines.push('  ' + CHARS.V_LINE + CHARS.SOLID.repeat(vpWidth) + CHARS.V_LINE);
    
    // Extended content (now visible)
    lines.push('  ' + CHARS.V_LINE + CHARS.SOLID.repeat(vpWidth) + CHARS.V_LINE);
    
    // Body border
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(vpWidth) + CHARS.BOTTOM_RIGHT);
    lines.push('  }');
    
    return lines;
  }
}

module.exports = OverflowMaskingGenerator;
