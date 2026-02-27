/**
 * Type definitions for ASCII Layout Visualizer
 * 
 * This file contains JSDoc type definitions for the visualizer system.
 * Since this is a JavaScript project, we use JSDoc for type documentation.
 */

/**
 * @typedef {'fixed-dimensions' | 'viewport-overflow' | 'flex-fragility' | 'grid-rigidity' | 'fixed-spacing' | 'media-instability' | 'overflow-masking' | 'breakpoint-exceeded' | 'absolute-rigidity' | 'box-inconsistency' | 'overflow-horizontal' | 'nowrap-fixed'} IssueType
 */

/**
 * @typedef {'critical' | 'medium' | 'low'} Severity
 */

/**
 * @typedef {'flex' | 'grid' | 'overflow' | 'other'} Category
 */

/**
 * @typedef {Object} Issue
 * @property {IssueType} type - The type of layout issue
 * @property {Severity} severity - The severity level
 * @property {number} line - Line number in source file
 * @property {string} selector - CSS selector
 * @property {string} property - CSS property name
 * @property {string} value - CSS property value
 * @property {string} suggestion - Suggested fix
 * @property {Category} category - Issue category
 */

/**
 * @typedef {Object} Visualization
 * @property {string} ascii - The complete ASCII art string
 * @property {number} width - Actual width in characters
 * @property {number} height - Actual height in lines
 * @property {number} generationTime - Time taken in milliseconds
 */

/**
 * @typedef {Object} HeaderData
 * @property {string} type - Issue type display name
 * @property {string} severity - Severity level
 * @property {string} severityEmoji - Emoji for severity
 * @property {number} line - Line number
 */

/**
 * @typedef {Object} LayoutData
 * @property {string} label - Label (e.g., "ANTES", "DEPOIS")
 * @property {string} statusEmoji - Status emoji (❌ or ✅)
 * @property {string[]} content - Array of content lines
 * @property {string} measurements - Measurement text (e.g., "600px width")
 */

/**
 * @typedef {Object} ViewportData
 * @property {string} label - Viewport label (e.g., "Mobile 375px")
 * @property {string[]} visualization - Visualization lines
 */

/**
 * @typedef {Object} FooterData
 * @property {ViewportData[]} [viewports] - Optional viewport data
 * @property {string[]} [notes] - Optional notes
 */

/**
 * @typedef {Object} TemplateData
 * @property {HeaderData} header - Header data
 * @property {LayoutData} before - Before state data
 * @property {LayoutData} after - After state data
 * @property {FooterData} [footer] - Optional footer data
 */

module.exports = {};
