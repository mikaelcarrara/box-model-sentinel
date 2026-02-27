/**
 * Viewport Overflow Generator
 * 
 * Generates ASCII visualizations for viewport width overflow issues.
 * Shows BEFORE state with overflow on mobile/desktop and AFTER state with responsive solution.
 */

const BaseGenerator = require('./base-generator');
const { CHARS, EMOJI } = require('../core/character-palette');
const LayoutCalculator = require('../utils/layout-calculator');

/**
 * @typedef {import('../types').Issue} Issue
 * @typedef {import('../types').Visualization} Visualization
 */

/**
 * Generator for viewport-overflow issue type
 */
class ViewportOverflowGenerator extends BaseGenerator {
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
    return issueType === 'viewport-overflow';
  }

  /**
   * Generate visualization for viewport overflow issue
   * 
   * @param {Issue} issue - Issue data
   * @returns {Visualization} Generated visualization
   */
  generate(issue) {
    // Parse the element width
    const elementWidth = this.calculator.parseValue(issue.value) || 1200;
    
    // BEFORE: Show overflow on mobile viewport
    const beforeContent = this.renderViewportOverflow(elementWidth, 375, 'Mobile 375px');
    
    // AFTER: Show responsive solution
    const afterContent = this.renderResponsiveViewport(375, 'Mobile 375px');
    
    // Generate standard visualization
    return this.generateStandardVisualization(
      issue,
      'Viewport Overflow',
      beforeContent,
      afterContent
    );
  }
    const ascii = lines.join('\n');
    return {
      ascii,
      width: this.maxWidth,
      height: lines.length,
      generationTime: 0, // Set by visualizer
    };
  }

  /**
   * Render viewport with overflow
   * 
   * @param {number} elementWidth - Element width in pixels
   * @param {number} viewportWidth - Viewport width in pixels
   * @param {string} label - Viewport label (e.g., "Mobile 375px")
   * @returns {string[]} Array of visualization lines
   */
  renderViewportOverflow(elementWidth, viewportWidth, label) {
    const scale = 50; // Scale factor for visualization
    const boxWidth = Math.floor(elementWidth / scale);
    const vpWidth = Math.floor(viewportWidth / scale);
    
    const overflow = boxWidth > vpWidth;
    const visibleWidth = Math.min(boxWidth, vpWidth);
    const overflowWidth = overflow ? Math.min(boxWidth - vpWidth, 3) : 0;
    
    const lines = [];
    
    // Viewport label
    lines.push(`  ${label}`);
    
    // Viewport border
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(vpWidth) + CHARS.TOP_RIGHT);
    
    // Content with overflow indicator
    let contentLine = '  ' + CHARS.V_LINE + CHARS.SOLID.repeat(visibleWidth);
    if (overflow) {
      contentLine += CHARS.MEDIUM.repeat(overflowWidth) + CHARS.RIGHT;
    } else {
      contentLine += CHARS.V_LINE;
    }
    lines.push(contentLine);
    
    // Viewport border
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(vpWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }

  /**
   * Render responsive viewport without overflow
   * 
   * @param {number} viewportWidth - Viewport width in pixels
   * @param {string} label - Viewport label (e.g., "Mobile 375px")
   * @returns {string[]} Array of visualization lines
   */
  renderResponsiveViewport(viewportWidth, label) {
    const scale = 50;
    const vpWidth = Math.floor(viewportWidth / scale);
    
    const lines = [];
    
    // Viewport label
    lines.push(`  ${label}`);
    
    // Viewport border
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(vpWidth) + CHARS.TOP_RIGHT);
    
    // Content fits perfectly
    lines.push('  ' + CHARS.V_LINE + CHARS.SOLID.repeat(vpWidth) + CHARS.V_LINE);
    
    // Viewport border
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(vpWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }
}

module.exports = ViewportOverflowGenerator;
