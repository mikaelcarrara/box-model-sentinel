/**
 * Breakpoint Exceeded Generator
 * 
 * Generates ASCII visualizations for breakpoint exceeded issues.
 * Shows BEFORE state with content exceeding breakpoint and AFTER state with adjusted breakpoint.
 */

const BaseGenerator = require('./base-generator');
const { CHARS, EMOJI } = require('../core/character-palette');
const LayoutCalculator = require('../utils/layout-calculator');

/**
 * @typedef {import('../types').Issue} Issue
 * @typedef {import('../types').Visualization} Visualization
 */

/**
 * Generator for breakpoint-exceeded issue type
 */
class BreakpointExceededGenerator extends BaseGenerator {
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
    return issueType === 'breakpoint-exceeded';
  }

  /**
   * Generate visualization for breakpoint exceeded issue
   * 
   * @param {Issue} issue - Issue data
   * @returns {Visualization} Generated visualization
   */
  generate(issue) {
    // BEFORE: Content exceeds breakpoint
    const beforeContent = this.renderExceededBreakpoint();
    
    // AFTER: Adjusted breakpoint
    const afterContent = this.renderAdjustedBreakpoint();
    
    // Generate standard visualization
    return this.generateStandardVisualization(
      issue,
      'Breakpoint Exceeded',
      beforeContent,
      afterContent
    );
  }

  /**
   * Render exceeded breakpoint visualization
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderExceededBreakpoint() {
    const breakpointWidth = 12;
    const contentWidth = 16;
    const lines = [];
    
    // Breakpoint indicator
    lines.push('  @media (max: 768px)');
    
    // Container at breakpoint
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(breakpointWidth) + CHARS.TOP_RIGHT);
    
    // Content exceeds breakpoint
    let contentLine = '  ' + CHARS.V_LINE + CHARS.SOLID.repeat(breakpointWidth);
    contentLine += CHARS.MEDIUM.repeat(Math.min(contentWidth - breakpointWidth, 3)) + CHARS.RIGHT;
    lines.push(contentLine);
    
    // Container border
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(breakpointWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }

  /**
   * Render adjusted breakpoint visualization
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderAdjustedBreakpoint() {
    const breakpointWidth = 16;
    const lines = [];
    
    // Breakpoint indicator
    lines.push('  @media (max: 1024px)');
    
    // Container at adjusted breakpoint
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(breakpointWidth) + CHARS.TOP_RIGHT);
    
    // Content fits within breakpoint
    lines.push('  ' + CHARS.V_LINE + CHARS.SOLID.repeat(breakpointWidth) + CHARS.V_LINE);
    
    // Container border
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(breakpointWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }
}

module.exports = BreakpointExceededGenerator;
