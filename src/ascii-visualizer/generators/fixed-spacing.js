/**
 * Fixed Spacing Generator
 * 
 * Generates ASCII visualizations for fixed spacing issues (padding/margin).
 * Shows BEFORE state with fixed spacing and AFTER state with responsive spacing.
 */

const BaseGenerator = require('./base-generator');
const { CHARS, EMOJI } = require('../core/character-palette');
const LayoutCalculator = require('../utils/layout-calculator');

/**
 * @typedef {import('../types').Issue} Issue
 * @typedef {import('../types').Visualization} Visualization
 */

/**
 * Generator for fixed-spacing issue type
 */
class FixedSpacingGenerator extends BaseGenerator {
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
    return issueType === 'fixed-spacing';
  }

  /**
   * Generate visualization for fixed spacing issue
   * 
   * @param {Issue} issue - Issue data
   * @returns {Visualization} Generated visualization
   */
  generate(issue) {
    // Parse spacing value
    const spacingValue = this.calculator.parseValue(issue.value) || 40;
    
    // BEFORE: Fixed spacing
    const beforeContent = this.renderFixedSpacing(spacingValue);
    
    // AFTER: Responsive spacing
    const afterContent = this.renderResponsiveSpacing();
    
    // Generate standard visualization
    return this.generateStandardVisualization(
      issue,
      'Fixed Spacing',
      beforeContent,
      afterContent
    );
  }
      generationTime: 0, // Set by visualizer
    };
  }

  /**
   * Render fixed spacing visualization
   * 
   * @param {number} spacingValue - Spacing value in pixels
   * @returns {string[]} Array of visualization lines
   */
  renderFixedSpacing(spacingValue) {
    const containerWidth = 18;
    const padding = Math.min(Math.floor(spacingValue / 10), 4);
    const contentWidth = containerWidth - (padding * 2);
    const lines = [];
    
    // Container
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.TOP_RIGHT);
    
    // Padding top
    lines.push('  ' + CHARS.V_LINE + CHARS.LIGHT.repeat(containerWidth) + CHARS.V_LINE);
    
    // Content with side padding
    let contentLine = '  ' + CHARS.V_LINE;
    contentLine += CHARS.LIGHT.repeat(padding);
    contentLine += CHARS.SOLID.repeat(contentWidth);
    contentLine += CHARS.LIGHT.repeat(padding);
    contentLine += CHARS.V_LINE;
    lines.push(contentLine);
    
    // Padding bottom
    lines.push('  ' + CHARS.V_LINE + CHARS.LIGHT.repeat(containerWidth) + CHARS.V_LINE);
    
    // Container
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }

  /**
   * Render responsive spacing visualization
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderResponsiveSpacing() {
    const containerWidth = 18;
    const padding = 2; // Smaller, responsive padding
    const contentWidth = containerWidth - (padding * 2);
    const lines = [];
    
    // Container
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.TOP_RIGHT);
    
    // Padding top (smaller)
    lines.push('  ' + CHARS.V_LINE + CHARS.LIGHT.repeat(containerWidth) + CHARS.V_LINE);
    
    // Content with side padding
    let contentLine = '  ' + CHARS.V_LINE;
    contentLine += CHARS.LIGHT.repeat(padding);
    contentLine += CHARS.SOLID.repeat(contentWidth);
    contentLine += CHARS.LIGHT.repeat(padding);
    contentLine += CHARS.V_LINE;
    lines.push(contentLine);
    
    // Padding bottom (smaller)
    lines.push('  ' + CHARS.V_LINE + CHARS.LIGHT.repeat(containerWidth) + CHARS.V_LINE);
    
    // Container
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(containerWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }
}

module.exports = FixedSpacingGenerator;
