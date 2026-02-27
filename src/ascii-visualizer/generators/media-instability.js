/**
 * Media Instability Generator
 * 
 * Generates ASCII visualizations for media query instability issues.
 * Shows BEFORE state with problematic breakpoints and AFTER state with stable media queries.
 */

const BaseGenerator = require('./base-generator');
const { CHARS, EMOJI } = require('../core/character-palette');
const LayoutCalculator = require('../utils/layout-calculator');

/**
 * @typedef {import('../types').Issue} Issue
 * @typedef {import('../types').Visualization} Visualization
 */

/**
 * Generator for media-instability issue type
 */
class MediaInstabilityGenerator extends BaseGenerator {
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
    return issueType === 'media-instability';
  }

  /**
   * Generate visualization for media instability issue
   * 
   * @param {Issue} issue - Issue data
   * @returns {Visualization} Generated visualization
   */
  generate(issue) {
    // BEFORE: Unstable media query
    const beforeContent = this.renderUnstableMedia();
    
    // AFTER: Stable media query
    const afterContent = this.renderStableMedia();
    
    // Generate standard visualization
    return this.generateStandardVisualization(
      issue,
      'Media Instability',
      beforeContent,
      afterContent
    );
  }

  /**
   * Render unstable media query visualization
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderUnstableMedia() {
    const lines = [];
    
    // Mobile viewport (375px)
    lines.push('  Mobile 375px');
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(7) + CHARS.TOP_RIGHT);
    lines.push('  ' + CHARS.V_LINE + CHARS.SOLID.repeat(7) + CHARS.RIGHT + ' breaks');
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(7) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }

  /**
   * Render stable media query visualization
   * 
   * @returns {string[]} Array of visualization lines
   */
  renderStableMedia() {
    const lines = [];
    
    // Mobile viewport (375px)
    lines.push('  Mobile 375px');
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(7) + CHARS.TOP_RIGHT);
    lines.push('  ' + CHARS.V_LINE + CHARS.SOLID.repeat(7) + CHARS.V_LINE + ' stable');
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(7) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }
}

module.exports = MediaInstabilityGenerator;
