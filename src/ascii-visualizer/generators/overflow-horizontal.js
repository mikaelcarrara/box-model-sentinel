/**
 * Horizontal Overflow Generator
 * 
 * Generates ASCII visualizations for horizontal overflow issues.
 * Shows BEFORE state with horizontal scrollbar and AFTER state with proper containment.
 */

const BaseGenerator = require('./base-generator');
const { CHARS, EMOJI } = require('../core/character-palette');
const LayoutCalculator = require('../utils/layout-calculator');

/**
 * @typedef {import('../types').Issue} Issue
 * @typedef {import('../types').Visualization} Visualization
 */

/**
 * Generator for overflow-horizontal issue type
 */
class OverflowHorizontalGenerator extends BaseGenerator {
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
    return issueType === 'overflow-horizontal';
  }

  /**
   * Generate visualization for horizontal overflow issue
   * 
   * @param {Issue} issue - Issue data
   * @returns {Visualization} Generated visualization
   */
  generate(issue) {
    // Parse the element width
    const elementWidth = this.calculator.parseValue(issue.value) || 800;
    const containerWidth = 400;
    
    // BEFORE: Show horizontal overflow with scrollbar
    const beforeContent = this.renderHorizontalOverflow(elementWidth, containerWidth);
    
    // AFTER: Show contained content
    const afterContent = this.renderContainedContent(containerWidth);
    
    // Generate standard visualization
    return this.generateStandardVisualization(
      issue,
      'Horizontal Overflow',
      beforeContent,
      afterContent
    );
  }
      height: lines.length,
      generationTime: 0, // Set by visualizer
    };
  }

  /**
   * Render horizontal overflow with scrollbar
   * 
   * @param {number} elementWidth - Element width in pixels
   * @param {number} containerWidth - Container width in pixels
   * @returns {string[]} Array of visualization lines
   */
  renderHorizontalOverflow(elementWidth, containerWidth) {
    const scale = 20;
    const boxWidth = Math.floor(elementWidth / scale);
    const vpWidth = Math.floor(containerWidth / scale);
    
    const visibleWidth = Math.min(boxWidth, vpWidth);
    const hasOverflow = boxWidth > vpWidth;
    
    const lines = [];
    
    // Container border
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(vpWidth) + CHARS.TOP_RIGHT);
    
    // Content with overflow indicator
    let contentLine = '  ' + CHARS.V_LINE + CHARS.SOLID.repeat(visibleWidth);
    if (hasOverflow) {
      contentLine += CHARS.RIGHT;
    } else {
      contentLine += CHARS.V_LINE;
    }
    lines.push(contentLine);
    
    // Scrollbar line (if overflow)
    if (hasOverflow) {
      const scrollbarWidth = Math.max(3, Math.floor(vpWidth / 3));
      const scrollbar = CHARS.MEDIUM.repeat(scrollbarWidth);
      lines.push('  ' + CHARS.V_LINE + scrollbar + ' '.repeat(vpWidth - scrollbarWidth) + CHARS.V_LINE);
    }
    
    // Container border
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(vpWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }

  /**
   * Render contained content without overflow
   * 
   * @param {number} containerWidth - Container width in pixels
   * @returns {string[]} Array of visualization lines
   */
  renderContainedContent(containerWidth) {
    const scale = 20;
    const vpWidth = Math.floor(containerWidth / scale);
    
    const lines = [];
    
    // Container border
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(vpWidth) + CHARS.TOP_RIGHT);
    
    // Content fits perfectly
    lines.push('  ' + CHARS.V_LINE + CHARS.SOLID.repeat(vpWidth) + CHARS.V_LINE);
    
    // Container border
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(vpWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }
}

module.exports = OverflowHorizontalGenerator;
