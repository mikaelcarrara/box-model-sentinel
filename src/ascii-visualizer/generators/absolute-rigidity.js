/**
 * Absolute Rigidity Generator
 * 
 * Generates ASCII visualizations for absolute positioning rigidity issues.
 * Shows BEFORE state with fixed absolute positioning and AFTER state with flexible positioning.
 */

const BaseGenerator = require('./base-generator');
const { CHARS, EMOJI } = require('../core/character-palette');
const LayoutCalculator = require('../utils/layout-calculator');

/**
 * @typedef {import('../types').Issue} Issue
 * @typedef {import('../types').Visualization} Visualization
 */

/**
 * Generator for absolute-rigidity issue type
 */
class AbsoluteRigidityGenerator extends BaseGenerator {
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
    return issueType === 'absolute-rigidity';
  }

  /**
   * Generate visualization for absolute rigidity issue
   * 
   * @param {Issue} issue - Issue data
   * @returns {Visualization} Generated visualization
   */
  generate(issue) {
    // BEFORE: Fixed absolute positioning
    const beforeContent = this.renderAbsolutePositioning();
    
    // AFTER: Flexible positioning
    const afterContent = this.renderFlexiblePositioning();
    
    // Generate standard visualization
    return this.generateStandardVisualization(
      issue,
      'Absolute Rigidity',
      beforeContent,
      afterContent
    );
  }

  /**
   * Render absolute positioning visualization
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderAbsolutePositioning() {
    const containerWidth = 18;
    const elementWidth = 6;
    const lines = [];
    
    // Container
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.TOP_RIGHT);
    
    // Empty space
    lines.push('  ' + CHARS.V_LINE + ' '.repeat(containerWidth) + CHARS.V_LINE);
    
    // Absolutely positioned element (fixed at specific position)
    let posLine = '  ' + CHARS.V_LINE;
    posLine += ' '.repeat(10); // Fixed left position
    posLine += CHARS.SOLID.repeat(elementWidth);
    posLine += ' '.repeat(containerWidth - 10 - elementWidth);
    posLine += CHARS.V_LINE;
    lines.push(posLine);
    
    // Empty space
    lines.push('  ' + CHARS.V_LINE + ' '.repeat(containerWidth) + CHARS.V_LINE);
    
    // Container
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }

  /**
   * Render flexible positioning visualization
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderFlexiblePositioning() {
    const containerWidth = 18;
    const elementWidth = 6;
    const lines = [];
    
    // Container
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.TOP_RIGHT);
    
    // Empty space
    lines.push('  ' + CHARS.V_LINE + ' '.repeat(containerWidth) + CHARS.V_LINE);
    
    // Relatively positioned element (flexible)
    let posLine = '  ' + CHARS.V_LINE;
    posLine += ' '.repeat(6); // Flexible position
    posLine += CHARS.SOLID.repeat(elementWidth);
    posLine += ' '.repeat(containerWidth - 6 - elementWidth);
    posLine += CHARS.V_LINE;
    lines.push(posLine);
    
    // Empty space
    lines.push('  ' + CHARS.V_LINE + ' '.repeat(containerWidth) + CHARS.V_LINE);
    
    // Container
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }
}

module.exports = AbsoluteRigidityGenerator;
