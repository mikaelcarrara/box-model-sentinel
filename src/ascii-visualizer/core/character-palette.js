/**
 * Character Palette for ASCII Visualizations
 * 
 * Defines the visual vocabulary used across all visualizations.
 * Uses box-drawing characters, indicators, and emojis for consistent representation.
 */

/**
 * Box-drawing and content characters
 */
const CHARS = {
  // Content
  SOLID: '█',
  MEDIUM: '▓',
  LIGHT: '░',
  
  // Borders
  H_LINE: '─',
  V_LINE: '│',
  TOP_LEFT: '┌',
  TOP_RIGHT: '┐',
  BOTTOM_LEFT: '└',
  BOTTOM_RIGHT: '┘',
  
  // Indicators
  DOWN: '▼',
  RIGHT: '►',
  LEFT: '◄',
  ELLIPSIS: '…',
  
  // Spacing
  SPACE: ' ',
  DOT: '•',
};

/**
 * Emoji indicators for severity and status
 */
const EMOJI = {
  // Severity (minimalista)
  CRITICAL: '✖',  // X simples
  MEDIUM: '⚠',    // Triângulo de alerta sem variation selector
  LOW: 'ⓘ',       // i circled
  
  // Status (minimalista)
  PROBLEM: '✖',   // X simples
  SOLUTION: '✓',  // Check simples
  ARROW: '→',
};

module.exports = {
  CHARS,
  EMOJI,
};
