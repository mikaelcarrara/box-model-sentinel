/**
 * Box Inconsistency Generator
 * 
 * Generates ASCII visualizations for box-sizing inconsistency issues.
 * Shows BEFORE state with content-box and AFTER state with border-box.
 */

const BaseGenerator = require('./base-generator');
const { CHARS, EMOJI } = require('../core/character-palette');
const LayoutCalculator = require('../utils/layout-calculator');

/**
 * @typedef {import('../types').Issue} Issue
 * @typedef {import('../types').Visualization} Visualization
 */

/**
 * Generator for box-inconsistency issue type
 */
class BoxInconsistencyGenerator extends BaseGenerator {
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
    return issueType === 'box-inconsistency';
  }

  /**
   * Generate visualization for box inconsistency issue
   * 
   * @param {Issue} issue - Issue data
   * @returns {Visualization} Generated visualization
   */
  generate(issue) {
    // BEFORE: content-box (padding/border adds to width)
    const beforeContent = this.renderContentBox();
    
    // AFTER: border-box (padding/border included in width)
    const afterContent = this.renderBorderBox();
    
    // Generate standard visualization
    return this.generateStandardVisualization(
      issue,
      'Box Inconsistency',
      beforeContent,
      afterContent
    );
  }

  /**
   * Render content-box visualization
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderContentBox() {
    const contentWidth = 12;
    const padding = 2;
    const totalWidth = contentWidth + (padding * 2);
    const lines = [];
    
    // Outer box (total width exceeds expected)
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(totalWidth) + CHARS.TOP_RIGHT + CHARS.RIGHT);
    
    // Padding top
    lines.push('  ' + CHARS.V_LINE + CHARS.LIGHT.repeat(totalWidth) + CHARS.V_LINE);
    
    // Content with padding
    let contentLine = '  ' + CHARS.V_LINE;
    contentLine += CHARS.LIGHT.repeat(padding);
    contentLine += CHARS.SOLID.repeat(contentWidth);
    contentLine += CHARS.LIGHT.repeat(padding);
    contentLine += CHARS.V_LINE;
    lines.push(contentLine);
    
    // Padding bottom
    lines.push('  ' + CHARS.V_LINE + CHARS.LIGHT.repeat(totalWidth) + CHARS.V_LINE);
    
    // Outer box
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(totalWidth) + CHARS.BOTTOM_RIGHT + CHARS.RIGHT);
    
    return lines;
  }

  /**
   * Render border-box visualization
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderBorderBox() {
    const totalWidth = 12;
    const padding = 2;
    const contentWidth = totalWidth - (padding * 2);
    const lines = [];
    
    // Outer box (total width as expected)
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(totalWidth) + CHARS.TOP_RIGHT);
    
    // Padding top
    lines.push('  ' + CHARS.V_LINE + CHARS.LIGHT.repeat(totalWidth) + CHARS.V_LINE);
    
    // Content with padding (fits within total width)
    let contentLine = '  ' + CHARS.V_LINE;
    contentLine += CHARS.LIGHT.repeat(padding);
    contentLine += CHARS.SOLID.repeat(contentWidth);
    contentLine += CHARS.LIGHT.repeat(padding);
    contentLine += CHARS.V_LINE;
    lines.push(contentLine);
    
    // Padding bottom
    lines.push('  ' + CHARS.V_LINE + CHARS.LIGHT.repeat(totalWidth) + CHARS.V_LINE);
    
    // Outer box
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(totalWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }
}

module.exports = BoxInconsistencyGenerator;
