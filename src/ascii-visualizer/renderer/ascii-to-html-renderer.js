/**
 * ASCII to HTML Renderer
 * Converts ASCII art visualizations to styled HTML with proper theming
 */

/**
 * @typedef {Object} AsciiToHtmlOptions
 * @property {number} [fontSize=12] - Font size in pixels
 * @property {string} [fontFamily='Courier New, Consolas, Monaco, monospace'] - Font family
 * @property {'dark'|'light'} [theme='dark'] - Color theme
 * @property {boolean} [enableHover=true] - Enable hover effects
 * @property {boolean} [enableTooltips=true] - Enable character tooltips
 * @property {boolean} [enableCopyButton=true] - Show copy button
 * @property {boolean} [inlineStyles=false] - Use inline styles instead of CSS classes
 */

/**
 * Character type mappings for styling
 */
const CHAR_TYPES = {
  SOLID: 'ascii-solid',
  SCROLLBAR: 'ascii-scrollbar',
  PADDING: 'ascii-padding',
  BORDER: 'ascii-border',
  ARROW: 'ascii-arrow',
  ERROR: 'ascii-error',
  SUCCESS: 'ascii-success',
  WARNING: 'ascii-warning',
  TEXT: 'ascii-text',
};

/**
 * Character to type mapping
 */
const CHAR_MAP = {
  '█': CHAR_TYPES.SOLID,
  '▓': CHAR_TYPES.SCROLLBAR,
  '░': CHAR_TYPES.PADDING,
  '─': CHAR_TYPES.BORDER,
  '│': CHAR_TYPES.BORDER,
  '┌': CHAR_TYPES.BORDER,
  '┐': CHAR_TYPES.BORDER,
  '└': CHAR_TYPES.BORDER,
  '┘': CHAR_TYPES.BORDER,
  '├': CHAR_TYPES.BORDER,
  '┤': CHAR_TYPES.BORDER,
  '┬': CHAR_TYPES.BORDER,
  '┴': CHAR_TYPES.BORDER,
  '┼': CHAR_TYPES.BORDER,
  '►': CHAR_TYPES.ARROW,
  '◄': CHAR_TYPES.ARROW,
  '▼': CHAR_TYPES.ARROW,
  '▲': CHAR_TYPES.ARROW,
  '❌': CHAR_TYPES.ERROR,
  '✅': CHAR_TYPES.SUCCESS,
  '⚠️': CHAR_TYPES.WARNING,
  '🚫': CHAR_TYPES.ERROR,
  'ℹ️': CHAR_TYPES.WARNING,
};

/**
 * Tooltips for special characters
 */
const TOOLTIPS = {
  '█': 'Content area',
  '▓': 'Scrollbar (~15px)',
  '░': 'Padding/spacing',
  '►': 'Overflow direction',
  '◄': 'Overflow direction',
  '▼': 'Overflow direction',
  '❌': 'Problem detected',
  '✅': 'Recommended solution',
  '⚠️': 'Warning',
  '🚫': 'Critical issue',
  'ℹ️': 'Information',
};

class AsciiToHtmlRenderer {
  /**
   * @param {AsciiToHtmlOptions} options
   */
  constructor(options = {}) {
    this.options = {
      fontSize: options.fontSize || 12,
      fontFamily: options.fontFamily || 'Courier New, Consolas, Monaco, monospace',
      theme: options.theme || 'dark',
      enableHover: options.enableHover !== false,
      enableTooltips: options.enableTooltips !== false,
      enableCopyButton: options.enableCopyButton !== false,
      inlineStyles: options.inlineStyles || false,
    };

    // Cache for styles
    this._stylesCache = null;
    
    // Color schemes
    this.colors = this._getColors();
  }
  
  /**
   * Get color scheme based on theme
   * @private
   * @returns {object}
   */
  _getColors() {
    const isDark = this.options.theme === 'dark';
    return isDark
      ? {
          bg: '#1e1e1e',
          text: '#d4d4d4',
          solid: '#569cd6',
          scrollbar: '#dcdcaa',
          padding: '#4ec9b0',
          border: '#858585',
          arrow: '#f48771',
          error: '#f48771',
          success: '#4ec9b0',
          warning: '#dcdcaa',
          hover: 'rgba(255, 255, 255, 0.1)',
          buttonBg: '#2d2d30',
          buttonHover: '#3e3e42',
          buttonText: '#cccccc',
        }
      : {
          bg: '#ffffff',
          text: '#333333',
          solid: '#0066cc',
          scrollbar: '#b8860b',
          padding: '#008080',
          border: '#666666',
          arrow: '#cc0000',
          error: '#cc0000',
          success: '#008000',
          warning: '#b8860b',
          hover: 'rgba(0, 0, 0, 0.05)',
          buttonBg: '#f3f3f3',
          buttonHover: '#e5e5e5',
          buttonText: '#333333',
        };
  }

  /**
   * Get character type for styling
   * @private
   * @param {string} char
   * @returns {string}
   */
  _getCharType(char) {
    return CHAR_MAP[char] || CHAR_TYPES.TEXT;
  }

  /**
   * Get tooltip for character
   * @private
   * @param {string} char
   * @returns {string|null}
   */
  _getTooltip(char) {
    return this.options.enableTooltips ? (TOOLTIPS[char] || null) : null;
  }

  /**
   * Escape HTML special characters
   * @private
   * @param {string} text
   * @returns {string}
   */
  _escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Check if character is an emoji (multi-byte)
   * @private
   * @param {string} char
   * @returns {boolean}
   */
  _isEmoji(char) {
    // Check for emoji variation selector or multi-codepoint emojis
    return char.length > 1 || /[\u{1F300}-\u{1F9FF}]/u.test(char);
  }

  /**
   * Get inline style for character type
   * @private
   * @param {string} type
   * @returns {string}
   */
  _getInlineStyle(type) {
    if (!this.options.inlineStyles) return '';
    
    const colorMap = {
      'ascii-solid': `color: ${this.colors.solid}; font-weight: bold;`,
      'ascii-scrollbar': `color: ${this.colors.scrollbar}; font-weight: bold;`,
      'ascii-padding': `color: ${this.colors.padding}; opacity: 0.7;`,
      'ascii-border': `color: ${this.colors.border};`,
      'ascii-arrow': `color: ${this.colors.arrow}; font-weight: bold;`,
      'ascii-error': `color: ${this.colors.error}; font-weight: bold;`,
      'ascii-success': `color: ${this.colors.success}; font-weight: bold;`,
      'ascii-warning': `color: ${this.colors.warning}; font-weight: bold;`,
      'ascii-text': `color: ${this.colors.text};`,
    };
    
    return colorMap[type] || '';
  }

  /**
   * Render a single character
   * @private
   * @param {string} char
   * @param {number} lineIndex
   * @param {number} charIndex
   * @returns {string}
   */
  _renderChar(char, lineIndex, charIndex) {
    const type = this._getCharType(char);
    const tooltip = this._getTooltip(char);
    const isEmoji = this._isEmoji(char);
    const escaped = this._escapeHtml(char);

    const classes = ['ascii-char', type];
    if (isEmoji) classes.push('ascii-emoji');

    const attrs = [
      `class="${classes.join(' ')}"`,
      `data-char="${this._escapeHtml(char)}"`,
      `data-pos="${lineIndex},${charIndex}"`,
    ];
    
    // Add inline styles if enabled
    if (this.options.inlineStyles) {
      const inlineStyle = this._getInlineStyle(type);
      if (inlineStyle) {
        attrs.push(`style="${inlineStyle}"`);
      }
    }

    if (tooltip) {
      attrs.push(`title="${this._escapeHtml(tooltip)}"`);
      attrs.push(`aria-label="${this._escapeHtml(tooltip)}"`);
    }

    // Preserve spaces
    const content = char === ' ' ? '&nbsp;' : escaped;

    return `<span ${attrs.join(' ')}>${content}</span>`;
  }

  /**
   * Render ASCII text to HTML
   * @param {string} asciiText
   * @returns {string}
   */
  render(asciiText) {
    const startTime = performance.now();

    const lines = asciiText.split('\n');
    const lineElements = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const charElements = [];

      // Process each character (handle multi-byte emojis)
      let j = 0;
      while (j < line.length) {
        let char = line[j];
        
        // Check if next character is a variation selector or combining character
        if (j + 1 < line.length) {
          const nextCode = line.charCodeAt(j + 1);
          // Variation selectors (U+FE00-U+FE0F) or combining marks
          if ((nextCode >= 0xFE00 && nextCode <= 0xFE0F) || (nextCode >= 0x0300 && nextCode <= 0x036F)) {
            char += line[j + 1];
            j++;
          }
        }
        
        charElements.push(this._renderChar(char, i, j));
        j++;
      }

      // Wrap line
      lineElements.push(
        `<div class="ascii-line" data-line="${i}">${charElements.join('')}</div>`
      );
    }

    const html = [
      `<div class="ascii-visualization" data-theme="${this.options.theme}" role="img" aria-label="ASCII visualization">`,
      this.options.enableCopyButton ? this._renderCopyButton(asciiText) : '',
      `<div class="ascii-content">`,
      lineElements.join(''),
      `</div>`,
      `</div>`,
    ].join('');

    const renderTime = performance.now() - startTime;
    if (renderTime > 10) {
      console.warn(`[AsciiRenderer] Slow render: ${renderTime.toFixed(2)}ms`);
    }

    return html;
  }

  /**
   * Render copy button
   * @private
   * @param {string} asciiText
   * @returns {string}
   */
  _renderCopyButton(asciiText) {
    const escaped = this._escapeHtml(asciiText);
    return `
      <button class="ascii-copy-btn" 
              onclick="navigator.clipboard.writeText(this.dataset.ascii).then(() => { this.textContent = '✓ Copied!'; setTimeout(() => this.textContent = 'Copy ASCII', 1000); })"
              data-ascii="${escaped}"
              title="Copy raw ASCII text"
              aria-label="Copy ASCII visualization to clipboard">
        Copy ASCII
      </button>
    `;
  }

  /**
   * Generate CSS styles
   * @returns {string}
   */
  getStyles() {
    if (this._stylesCache) {
      return this._stylesCache;
    }

    const isDark = this.options.theme === 'dark';
    const colors = isDark
      ? {
          bg: '#1e1e1e',
          text: '#d4d4d4',
          solid: '#569cd6',
          scrollbar: '#dcdcaa',
          padding: '#4ec9b0',
          border: '#858585',
          arrow: '#f48771',
          error: '#f48771',
          success: '#4ec9b0',
          warning: '#dcdcaa',
          hover: 'rgba(255, 255, 255, 0.1)',
          buttonBg: '#2d2d30',
          buttonHover: '#3e3e42',
          buttonText: '#cccccc',
        }
      : {
          bg: '#ffffff',
          text: '#333333',
          solid: '#0066cc',
          scrollbar: '#b8860b',
          padding: '#008080',
          border: '#666666',
          arrow: '#cc0000',
          error: '#cc0000',
          success: '#008000',
          warning: '#b8860b',
          hover: 'rgba(0, 0, 0, 0.05)',
          buttonBg: '#f3f3f3',
          buttonHover: '#e5e5e5',
          buttonText: '#333333',
        };

    this._stylesCache = `
/* ASCII Visualization Styles */
.ascii-visualization {
  position: relative;
  background-color: ${colors.bg};
  color: ${colors.text};
  font-family: ${this.options.fontFamily};
  font-size: ${this.options.fontSize}px;
  line-height: 1.2;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre;
  animation: ascii-fade-in 0.2s ease-in;
}

@keyframes ascii-fade-in {
  from { opacity: 0; transform: translateY(-2px); }
  to { opacity: 1; transform: translateY(0); }
}

.ascii-content {
  display: inline-block;
  min-width: 100%;
}

.ascii-line {
  white-space: pre;
  min-height: 1.2em;
}

.ascii-char {
  display: inline-block;
  transition: background-color 0.15s ease;
}

${
  this.options.enableHover
    ? `
.ascii-char:hover {
  background-color: ${colors.hover};
  cursor: default;
}
`
    : ''
}

/* Character type styles */
.ascii-solid {
  color: ${colors.solid};
  font-weight: bold;
}

.ascii-scrollbar {
  color: ${colors.scrollbar};
  font-weight: bold;
}

.ascii-padding {
  color: ${colors.padding};
  opacity: 0.7;
}

.ascii-border {
  color: ${colors.border};
}

.ascii-arrow {
  color: ${colors.arrow};
  font-weight: bold;
}

.ascii-error {
  color: ${colors.error};
  font-weight: bold;
}

.ascii-success {
  color: ${colors.success};
  font-weight: bold;
}

.ascii-warning {
  color: ${colors.warning};
  font-weight: bold;
}

.ascii-text {
  color: ${colors.text};
}

.ascii-emoji {
  font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;
}

/* Copy button */
${
  this.options.enableCopyButton
    ? `
.ascii-copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  font-size: 11px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: ${colors.buttonBg};
  color: ${colors.buttonText};
  border: 1px solid ${colors.border};
  border-radius: 3px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s, background-color 0.2s;
  z-index: 10;
}

.ascii-copy-btn:hover {
  opacity: 1;
  background-color: ${colors.buttonHover};
}

.ascii-copy-btn:active {
  transform: translateY(1px);
}
`
    : ''
}

/* Tooltip styles (browser native) */
.ascii-char[title] {
  cursor: help;
}

/* Accessibility */
.ascii-visualization[role="img"] {
  display: block;
}

/* Print styles */
@media print {
  .ascii-visualization {
    background-color: white;
    color: black;
  }
  
  .ascii-copy-btn {
    display: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .ascii-visualization {
    border: 2px solid currentColor;
  }
  
  .ascii-char {
    font-weight: bold;
  }
}
`;

    return this._stylesCache;
  }

  /**
   * Clear styles cache (useful when changing theme)
   */
  clearCache() {
    this._stylesCache = null;
  }

  /**
   * Change theme and clear cache
   * @param {'dark'|'light'} theme
   */
  setTheme(theme) {
    this.options.theme = theme;
    this.colors = this._getColors();
    this.clearCache();
  }
}

module.exports = { AsciiToHtmlRenderer };
