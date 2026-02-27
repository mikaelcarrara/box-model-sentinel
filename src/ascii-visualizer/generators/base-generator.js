/**
 * Base Generator for ASCII Visualizations
 * 
 * Abstract base class providing common functionality for all issue type generators.
 * Handles header/footer rendering, BEFORE/AFTER comparison layout, and text formatting.
 */

const { CHARS, EMOJI } = require('../core/character-palette');
const TextFormatter = require('../utils/text-formatter');

/**
 * @typedef {import('../types').Issue} Issue
 * @typedef {import('../types').Visualization} Visualization
 * @typedef {import('../types').HeaderData} HeaderData
 * @typedef {import('../types').LayoutData} LayoutData
 * @typedef {import('../types').IssueType} IssueType
 * @typedef {import('../types').Severity} Severity
 */

/**
 * Base generator class - must be extended by specific generators
 */
class BaseGenerator {
  /**
   * @param {import('../core/template-engine').TemplateEngine} templateEngine
   */
  constructor(templateEngine) {
    this.templateEngine = templateEngine;
    this.maxWidth = 60;
    this.maxHeight = 20;
    this.formatter = new TextFormatter();
  }

  /**
   * Generate visualization for an issue
   * Must be implemented by subclasses
   * 
   * @param {Issue} issue - Issue data
   * @returns {Visualization} Generated visualization
   */
  generate(issue) {
    throw new Error('generate() must be implemented by subclass');
  }

  /**
   * Check if this generator supports the given issue type
   * Must be implemented by subclasses
   * 
   * @param {IssueType} issueType - Issue type to check
   * @returns {boolean} True if supported
   */
  supports(issueType) {
    throw new Error('supports() must be implemented by subclass');
  }

  /**
   * Render standard header with issue info
   * 
   * @param {HeaderData} data - Header data
   * @returns {string[]} Array of header lines
   */
  renderHeader(data) {
    const title = `${data.type.toUpperCase()} ${CHARS.DOT} ${data.severityEmoji} ${CHARS.DOT} L${data.line}`;
    const padding = this.maxWidth - 2;
    
    return [
      CHARS.TOP_LEFT + CHARS.H_LINE.repeat(padding) + CHARS.TOP_RIGHT,
      CHARS.V_LINE + this.pad(title, padding, 'left') + CHARS.V_LINE,
      CHARS.V_LINE + CHARS.H_LINE.repeat(padding) + CHARS.V_LINE,
    ];
  }

  /**
   * Render BEFORE/AFTER comparison layout
   * 
   * @param {LayoutData} before - Before state data
   * @param {LayoutData} after - After state data
   * @returns {string[]} Array of comparison lines
   */
  renderComparison(before, after) {
    const lines = [];
    const halfWidth = Math.floor((this.maxWidth - 2) / 2);
    
    // Labels line - account for emoji visual width (2 chars)
    const labelLine = this.pad(`  ${before.label}`, halfWidth) + 
                     EMOJI.ARROW + 
                     this.pad(`${after.label}`, halfWidth - 2); // -2 because emoji takes 2 visual spaces
    lines.push(CHARS.V_LINE + labelLine + CHARS.V_LINE);
    
    // Content lines (side by side) - ensure all lines are padded to full width
    const maxLines = Math.max(before.content.length, after.content.length);
    for (let i = 0; i < maxLines; i++) {
      const beforeLine = this.pad(before.content[i] || '', halfWidth);
      const afterLine = this.pad(after.content[i] || '', halfWidth - 1); // -1 for the space separator
      const fullLine = beforeLine + ' ' + afterLine;
      // Ensure the full line is exactly the right width
      const paddedLine = this.pad(fullLine, this.maxWidth - 2);
      lines.push(CHARS.V_LINE + paddedLine + CHARS.V_LINE);
    }
    
    // Measurements line - account for emoji visual width
    const measureLine = this.pad(`  ${before.statusEmoji} ${before.measurements}`, halfWidth) +
                       ' ' +
                       this.pad(`${after.statusEmoji} ${after.measurements}`, halfWidth - 1); // -1 for the space separator
    const paddedMeasureLine = this.pad(measureLine, this.maxWidth - 2);
    lines.push(CHARS.V_LINE + paddedMeasureLine + CHARS.V_LINE);
    
    return lines;
  }

  /**
   * Render footer with border
   * 
   * @returns {string[]} Array of footer lines
   */
  renderFooter() {
    const padding = this.maxWidth - 2;
    return [
      CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(padding) + CHARS.BOTTOM_RIGHT,
    ];
  }

  /**
   * Pad string to specified width with alignment
   * 
   * @param {string} text - Text to pad
   * @param {number} width - Target width
   * @param {'left'|'center'|'right'} align - Alignment
   * @returns {string} Padded text
   */
  pad(text, width, align = 'left') {
    return this.formatter.pad(text, width, align);
  }

  /**
   * Calculate visual length (emojis count as 2)
   * 
   * @param {string} text - Text to measure
   * @returns {number} Visual length
   */
  visualLength(text) {
    return this.formatter.visualLength(text);
  }

  /**
   * Truncate text with ellipsis
   * 
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncate(text, maxLength) {
    return this.formatter.truncate(text, maxLength);
  }

  /**
   * Get severity emoji for issue
   * 
   * @param {Severity} severity - Severity level
   * @returns {string} Emoji character
   */
  getSeverityEmoji(severity) {
    switch (severity) {
      case 'critical':
        return EMOJI.CRITICAL;
      case 'medium':
        return EMOJI.MEDIUM;
      case 'low':
        return EMOJI.LOW;
      default:
        return EMOJI.LOW;
    }
  }

  /**
   * Build complete visualization from parts
   * 
   * @param {string[][]} parts - Array of line arrays
   * @returns {string} Complete ASCII art string
   */
  buildVisualization(parts) {
    return parts.map(lines => lines.join('\n')).join('\n');
  }

  /**
   * Create a standard "before" layout data object
   * 
   * @param {string[]} content - Content lines
   * @param {string} measurements - Measurement text
   * @returns {LayoutData} Before layout data
   */
  createBeforeLayout(content, measurements) {
    return {
      label: 'BEFORE',
      statusEmoji: EMOJI.PROBLEM,
      content,
      measurements,
    };
  }

  /**
   * Create a standard "after" layout data object
   * 
   * @param {string[]} content - Content lines
   * @param {string} measurements - Measurement text
   * @returns {LayoutData} After layout data
   */
  createAfterLayout(content, measurements) {
    return {
      label: 'AFTER',
      statusEmoji: EMOJI.SOLUTION,
      content,
      measurements,
    };
  }

  /**
   * Generate a complete standard visualization with header, comparison, and footer
   * 
   * @param {Issue} issue - Issue data
   * @param {string} typeLabel - Display label for issue type
   * @param {string[]} beforeContent - Before state content lines
   * @param {string[]} afterContent - After state content lines
   * @returns {Visualization} Complete visualization
   */
  generateStandardVisualization(issue, typeLabel, beforeContent, afterContent) {
    const lines = [];
    
    // Header
    const headerData = {
      type: typeLabel,
      severity: issue.severity,
      severityEmoji: this.getSeverityEmoji(issue.severity),
      line: issue.line,
    };
    lines.push(...this.renderHeader(headerData));
    
    // Comparison
    const before = this.createBeforeLayout(beforeContent, `${issue.property}: ${issue.value}`);
    const after = this.createAfterLayout(afterContent, issue.suggestion || 'Use responsive units');
    lines.push(...this.renderComparison(before, after));
    
    // Footer
    lines.push(...this.renderFooter());
    
    const ascii = lines.join('\n');
    return {
      ascii,
      width: this.maxWidth,
      height: lines.length,
      generationTime: 0,
    };
  }
}

module.exports = BaseGenerator;
