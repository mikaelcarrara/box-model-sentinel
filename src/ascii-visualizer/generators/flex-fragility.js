/**
 * Flex Fragility Generator
 * 
 * Generates ASCII visualizations for flex layout fragility issues.
 * Shows BEFORE state with fixed-width flex children overflowing and AFTER state with flex-wrap.
 */

const BaseGenerator = require('./base-generator');
const { CHARS, EMOJI } = require('../core/character-palette');
const LayoutCalculator = require('../utils/layout-calculator');

/**
 * @typedef {import('../types').Issue} Issue
 * @typedef {import('../types').Visualization} Visualization
 */

/**
 * Generator for flex-fragility issue type
 */
class FlexFragilityGenerator extends BaseGenerator {
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
    return issueType === 'flex-fragility';
  }

  /**
   * Generate visualization for flex fragility issue
   * 
   * @param {Issue} issue - Issue data
   * @returns {Visualization} Generated visualization
   */
  generate(issue) {
    // BEFORE: Fixed-width flex children overflow
    const beforeContent = this.renderRigidFlex();
    
    // AFTER: Flex-wrap solution
    const afterContent = this.renderFlexibleFlex();
    
    // Generate standard visualization
    return this.generateStandardVisualization(
      issue,
      'Flex Fragility',
      beforeContent,
      afterContent
    );
  }

  /**
   * Render rigid flex container with overflow
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderRigidFlex() {
    const containerWidth = 18;
    const itemWidth = 6;
    const lines = [];
    
    // Flex container
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.TOP_RIGHT);
    
    // Flex items (3 items, overflow)
    let itemsLine = '  ' + CHARS.V_LINE;
    itemsLine += CHARS.SOLID.repeat(itemWidth) + ' ';
    itemsLine += CHARS.SOLID.repeat(itemWidth) + ' ';
    itemsLine += CHARS.SOLID.repeat(Math.min(itemWidth, containerWidth - 14));
    itemsLine += CHARS.RIGHT; // Overflow indicator
    lines.push(itemsLine);
    
    // Container border
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }

  /**
   * Render flexible flex container with wrap
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderFlexibleFlex() {
    const containerWidth = 18;
    const itemWidth = 6;
    const lines = [];
    
    // Flex container
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.TOP_RIGHT);
    
    // First row (2 items fit)
    let row1 = '  ' + CHARS.V_LINE;
    row1 += CHARS.SOLID.repeat(itemWidth) + ' ';
    row1 += CHARS.SOLID.repeat(itemWidth);
    row1 += ' '.repeat(containerWidth - 13) + CHARS.V_LINE;
    lines.push(row1);
    
    // Second row (1 item wrapped)
    let row2 = '  ' + CHARS.V_LINE;
    row2 += CHARS.SOLID.repeat(itemWidth);
    row2 += ' '.repeat(containerWidth - itemWidth) + CHARS.V_LINE;
    lines.push(row2);
    
    // Container border
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }
}

module.exports = FlexFragilityGenerator;
