/**
 * Grid Rigidity Generator
 * 
 * Generates ASCII visualizations for grid layout rigidity issues.
 * Shows BEFORE state with fixed columns and AFTER state with responsive grid (auto-fit, minmax).
 */

const BaseGenerator = require('./base-generator');
const { CHARS, EMOJI } = require('../core/character-palette');
const LayoutCalculator = require('../utils/layout-calculator');

/**
 * @typedef {import('../types').Issue} Issue
 * @typedef {import('../types').Visualization} Visualization
 */

/**
 * Generator for grid-rigidity issue type
 */
class GridRigidityGenerator extends BaseGenerator {
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
    return issueType === 'grid-rigidity';
  }

  /**
   * Generate visualization for grid rigidity issue
   * 
   * @param {Issue} issue - Issue data
   * @returns {Visualization} Generated visualization
   */
  generate(issue) {
    // BEFORE: Fixed grid columns overflow
    const beforeContent = this.renderRigidGrid();
    
    // AFTER: Responsive grid
    const afterContent = this.renderResponsiveGrid();
    
    // Generate standard visualization
    return this.generateStandardVisualization(
      issue,
      'Grid Rigidity',
      beforeContent,
      afterContent
    );
  }

  /**
   * Render rigid grid with fixed columns
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderRigidGrid() {
    const containerWidth = 18;
    const colWidth = 5;
    const gap = 1;
    const lines = [];
    
    // Grid container
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.TOP_RIGHT);
    
    // Grid items (4 columns, overflow)
    let row1 = '  ' + CHARS.V_LINE;
    row1 += CHARS.SOLID.repeat(colWidth) + ' ';
    row1 += CHARS.SOLID.repeat(colWidth) + ' ';
    row1 += CHARS.SOLID.repeat(colWidth);
    row1 += CHARS.RIGHT; // Overflow indicator
    lines.push(row1);
    
    // Container border
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }

  /**
   * Render responsive grid with auto-fit
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderResponsiveGrid() {
    const containerWidth = 18;
    const colWidth = 5;
    const gap = 1;
    const lines = [];
    
    // Grid container
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.TOP_RIGHT);
    
    // First row (3 columns fit)
    let row1 = '  ' + CHARS.V_LINE;
    row1 += CHARS.SOLID.repeat(colWidth) + ' ';
    row1 += CHARS.SOLID.repeat(colWidth) + ' ';
    row1 += CHARS.SOLID.repeat(colWidth);
    row1 += ' '.repeat(containerWidth - (colWidth * 3 + 2)) + CHARS.V_LINE;
    lines.push(row1);
    
    // Second row (1 column wrapped)
    let row2 = '  ' + CHARS.V_LINE;
    row2 += CHARS.SOLID.repeat(colWidth);
    row2 += ' '.repeat(containerWidth - colWidth) + CHARS.V_LINE;
    lines.push(row2);
    
    // Container border
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }
}

module.exports = GridRigidityGenerator;
