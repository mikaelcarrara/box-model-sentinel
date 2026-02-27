/**
 * Box Model Sentinel - Lint Engine
 * Motor de análise em tempo real de integridade de CSS
 */

const vscode = require('vscode');
const path = require('path');
const { parseRules } = require('./parser');
const { AsciiVisualizer } = require('../ascii-visualizer/core/visualizer');

/**
 * LintEngine handles real-time CSS analysis with debouncing
 * Integrates with the host diagnostic system
 */
class LintEngine {
  constructor() {
    /** @type {Map<string, NodeJS.Timeout>} */
    this.debounceTimers = new Map();

    /** @type {vscode.DiagnosticCollection} */
    this.diagnosticCollection = null;

    /** @type {Map<string, object[]>} Cache de issues por URI */
    this.issuesByUri = new Map();

    /** @type {Function|null} Callback legado quando análise completa (compat) */
    this.onAnalysisCompleteCallback = null;
    /** @type {Set<Function>} Observadores de análise completa */
    this.analysisListeners = new Set();

    /** ASCII Visualizer instance */
    this.visualizer = new AsciiVisualizer();

    /** Configuration */
    this.config = {
      debounceMs: 500,
      maxProblems: 100,
      enable: true,
      mode: 'strict',
      fixedWidthThreshold: 320,
      fixedHeightThreshold: 320,
      fixedSpacingThreshold: 24,
      ignoreSelectors: [],
      deltaIgnorePx: 5,
      frameThresholdMs: 16
    };

    this.loadConfiguration();
  }

  /**
   * Load configuration from editor settings
   */
  loadConfiguration() {
    const config = vscode.workspace.getConfiguration('boxModelSentinel');
    this.config.debounceMs = config.get('debounceMs', 500);
    this.config.maxProblems = config.get('maxProblems', 100);
    this.config.enable = config.get('enable', true);
    this.config.mode = config.get('mode', 'strict');
    this.config.fixedWidthThreshold = config.get('fixedWidthThreshold', 320);
    this.config.fixedHeightThreshold = config.get('fixedHeightThreshold', 320);
    this.config.fixedSpacingThreshold = config.get('fixedSpacingThreshold', 24);
    this.config.ignoreSelectors = config.get('ignoreSelectors', []);
    this.config.deltaIgnorePx = config.get('deltaIgnorePx', 5);
    this.config.frameThresholdMs = config.get('frameThresholdMs', 16);
  }

  /**
   * Set the diagnostic collection for this engine
   * @param {vscode.DiagnosticCollection} collection
   */
  setDiagnosticCollection(collection) {
    this.diagnosticCollection = collection;
  }

  /**
   * Get cached issues for a URI
   * @param {vscode.Uri | string} uri
   * @returns {object[]}
   */
  getIssuesForUri(uri) {
    const uriStr = typeof uri === 'string' ? uri : uri.toString();
    return this.issuesByUri.get(uriStr) || [];
  }

  /**
   * Cache issues for a URI
   * @private
   * @param {vscode.Uri | string} uri
   * @param {object[]} issues
   */
  _cacheIssues(uri, issues) {
    const uriStr = typeof uri === 'string' ? uri : uri.toString();
    this.issuesByUri.set(uriStr, issues);
  }

  /**
   * Register a callback for when analysis is complete
   * @param {Function} callback - Called with (uri, issues)
   */
  onAnalysisComplete(callback) {
    this.onAnalysisCompleteCallback = callback;
  }

  /**
   * Adiciona um listener para o evento de análise completa
   * @param {(uri: vscode.Uri, issues: object[]) => void} listener
   * @returns {() => void} função para remover o listener
   */
  addAnalysisListener(listener) {
    if (typeof listener === 'function') {
      this.analysisListeners.add(listener);
      return () => this.analysisListeners.delete(listener);
    }
    return () => {};
  }

  /**
   * Determine if a document should be analyzed
   * @param {vscode.TextDocument} document
   * @returns {boolean}
   */
  shouldAnalyze(document) {
    if (!this.config.enable) {
      console.log(`[BMS-Engine] ⏸️  Extension disabled, skipping ${document.fileName}`);
      return false;
    }

    const supportedLanguages = ['css', 'scss', 'less', 'sass'];
    if (!supportedLanguages.includes(document.languageId)) {
      console.log(`[BMS-Engine] ⏸️  Not a CSS/SCSS file (languageId=${document.languageId}): ${document.fileName}`);
      return false;
    }

    // Ignore temporary or unsaved files
    if (document.isUntitled && document.fileName.includes('Untitled')) {
      console.log(`[BMS-Engine] ⏸️  Ignoring untitled file: ${document.fileName}`);
      return false;
    }

    console.log(`[BMS-Engine] ✅ Will analyze file (languageId=${document.languageId}): ${document.fileName}`);
    return true;
  }

  /**
   * Analyze a document (with debounce)
   * @param {vscode.TextDocument} document
   */
  analyze(document) {
    const fileUri = document.uri.toString();
    console.log(`[BMS-Engine] ⏱️  Queuing analysis (debounce ${this.config.debounceMs}ms) for: ${document.fileName}`);

    // Clear existing debounce timer for this file
    if (this.debounceTimers.has(fileUri)) {
      console.log(`[BMS-Engine] 🔄 Clearing previous timer for: ${document.fileName}`);
      clearTimeout(this.debounceTimers.get(fileUri));
    }

    // Set new debounce timer
    const timer = setTimeout(() => {
      console.log(`[BMS-Engine] ⏲️  Debounce timer fired, executing analysis...`);
      this.executeAnalysis(document);
      this.debounceTimers.delete(fileUri);
    }, this.config.debounceMs);

    this.debounceTimers.set(fileUri, timer);
  }

  /**
   * Execute the actual analysis
   * @param {vscode.TextDocument} document
   */
  executeAnalysis(document) {
    try {
      console.log(`[BMS-Engine] 🔬 Starting analysis of: ${document.uri.fsPath}`);
      const css = document.getText();
      const issues = this.detectIssues(css, document);

      console.log(`[BMS-Engine] 📌 Detected ${issues.length} issues before filtering`);

      // Limit number of issues
      const limitedIssues = issues.slice(0, this.config.maxProblems);
      console.log(`[BMS-Engine] ✂️  Limited to ${limitedIssues.length} issues (max: ${this.config.maxProblems})`);

      // Cache issues for hover/code action providers
      this._cacheIssues(document.uri, limitedIssues);

      // Notificar observadores
      if (this.onAnalysisCompleteCallback) {
        try {
          this.onAnalysisCompleteCallback(document.uri, limitedIssues);
        } catch {}
      }
      if (this.analysisListeners.size > 0) {
        for (const l of Array.from(this.analysisListeners)) {
          try { l(document.uri, limitedIssues); } catch {}
        }
      }

      // Convert issues to Diagnostics
      const diagnostics = this.issuesToDiagnostics(limitedIssues, document);
      console.log(`[BMS-Engine] 🎯 Created ${diagnostics.length} diagnostics`);

      // Debug: print diagnostic details
      if (diagnostics.length > 0) {
        const first = diagnostics[0];
        console.log(`[BMS-Engine] 📍 First diagnostic: line ${first.range.start.line}, message: ${first.message.split('\n')[0]}`);
      }

      // Update diagnostic collection
      if (this.diagnosticCollection) {
        console.log(`[BMS-Engine] 📤 Setting diagnostics in collection for: ${document.uri.fsPath}`);
        this.diagnosticCollection.set(document.uri, diagnostics);
        console.log(`[BMS-Engine] ✅ Diagnostics set successfully`);
      } else {
        console.error(`[BMS-Engine] ❌ DiagnosticCollection is not set!`);
      }
    } catch (error) {
      console.error(`[BMS-Engine] ❌ Error analyzing ${document.fileName}:`, error);
      // Clear diagnostics on error
      if (this.diagnosticCollection) {
        this.diagnosticCollection.set(document.uri, []);
      }
    }
  }

  /**
   * Parse CSS and detect all layout issues
   * @param {string} css
   * @param {vscode.TextDocument} document
   * @returns {object[]}
   */
  detectIssues(css, document) {
    if (['less', 'sass'].includes(document.languageId)) {
      return this.detectIssuesFromText(css, document);
    }
    const parsed = parseRules(css);

    // Apply ignoreSelectors filter upfront (simple includes match)
    try {
      const patterns = Array.isArray(this.config.ignoreSelectors)
        ? this.config.ignoreSelectors.filter(s => typeof s === 'string' && s.trim()).map(s => s.toLowerCase())
        : [];
      if (patterns.length) {
        parsed.rules = (parsed.rules || []).filter(r => {
          const sel = String(r.selector || '').toLowerCase();
          return !patterns.some(p => sel.includes(p));
        });
      }
    } catch (_) {}

    // Gather all issues from detectors
    const detectors = [
      this.detectFixedDimensions,
      this.detectBoxModel,
      this.detectOverflowHorizontal,
      this.detectMediaConflicts,
      this.detectOverflowMaskBody,
      this.detectVwWidthRisk,
      this.detectBreakpointFixedWidth,
      this.detectMediaWidthInstability,
      this.detectFlexFragility,
      this.detectGridRigidity,
      this.detectAbsoluteContainment,
      this.detectAntiPatterns
    ];

    const issues = [];
    for (const detector of detectors) {
      const result = detector.call(this, { parsed, css });
      if (Array.isArray(result)) {
        issues.push(...result);
      }
    }

    // Map selectors to line numbers
    return this.mapIssuesToLines(issues, document);
  }

  /**
   * Centralized threshold decision
   * @param {'width'|'height'|'spacing'|'flex-basis'|'grid-track'} type
   * @param {number} numericValue
   * @returns {boolean}
   */
  shouldReportFixedValue(type, numericValue) {
    const mode = (this.config.mode || 'strict').toLowerCase();
    if (mode === 'strict') return true;
    if (!Number.isFinite(numericValue)) return true;
    switch (type) {
      case 'width':
      case 'grid-track':
      case 'flex-basis':
        return numericValue > (this.config.fixedWidthThreshold || 0);
      case 'height':
        return numericValue > (this.config.fixedHeightThreshold || 0);
      case 'spacing':
        return numericValue > (this.config.fixedSpacingThreshold || 0);
      default:
        return true;
    }
  }

  /**
   * Map selector positions to line numbers in the document
   * @param {object[]} issues
   * @param {vscode.TextDocument} document
   * @returns {object[]}
   */
  mapIssuesToLines(issues, document) {
    const text = document.getText();
    const lines = text.split('\n');

    return issues.map((issue) => {
      // Find the line number where the selector appears
      let lineNumber = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(issue.selector)) {
          lineNumber = i;
          break;
        }
      }

      // Try to locate the problematic value within the selector block
      let targetLine = lineNumber;
      let startChar = 0;
      let endChar = 0;

      const endBlockLine = (() => {
        for (let i = lineNumber; i < lines.length; i++) {
          if (/\}/.test(lines[i])) return i;
        }
        return Math.min(lines.length - 1, lineNumber + 10);
      })();

      const unitRegex = /\b\d+(\.\d+)?\s*px\b/i;
      const propertyRegex = issue.property
        ? new RegExp(`${issue.property}\\s*:\\s*[^;]*\\b\\d+(?:\\.\\d+)?\\s*px\\b`, 'i')
        : null;

      let found = false;
      for (let i = lineNumber; i <= endBlockLine; i++) {
        const ln = lines[i] || '';
        let match = null;

        if (propertyRegex) {
          match = ln.match(propertyRegex);
        }
        if (!match) {
          match = ln.match(unitRegex);
        }
        if (match) {
          targetLine = i;
          const full = match[0];
          const index = ln.indexOf(full);
          // Highlight only the numeric unit part when possible
          const unitMatch = full.match(unitRegex);
          if (unitMatch) {
            const unitIndex = ln.indexOf(unitMatch[0], index);
            startChar = unitIndex;
            endChar = unitIndex + unitMatch[0].length;
          } else {
            startChar = index;
            endChar = index + full.length;
          }
          found = true;
          break;
        }
      }

      if (!found) {
        const line = lines[lineNumber] || '';
        const lineLength = line.length;
        startChar = 0;
        endChar = Math.max(1, lineLength);
      }

      return {
        ...issue,
        suggestion: issue.suggestion || issue.correction,
        lineNumber: targetLine,
        range: new vscode.Range(
          new vscode.Position(targetLine, startChar),
          new vscode.Position(targetLine, endChar)
        )
      };
    });
  }

  detectIssuesFromText(css, document) {
    const lines = css.split('\n');
    const issues = [];
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i] || '';
      const w = ln.match(/width:\s*(\d+(\.\d+)?)px/i);
      const h = ln.match(/height:\s*(\d+(\.\d+)?)px/i);
      if (w) {
        const unit = w[0].match(/\d+(\.\d+)?\s*px/i)[0];
        const unitIndex = ln.indexOf(unit);
        issues.push({
          issue: 'Fixed width',
          explanation: 'Fixed pixel width reduces responsiveness',
          viewportImpact: 'Constrained layout on smaller viewports',
          severity: 'medium',
          correction: 'Use relative units or max-width',
          property: 'width',
          value: w[0],
          lineNumber: i,
          range: new vscode.Range(new vscode.Position(i, unitIndex), new vscode.Position(i, unitIndex + unit.length))
        });
      }
      if (h) {
        const unit = h[0].match(/\d+(\.\d+)?\s*px/i)[0];
        const unitIndex = ln.indexOf(unit);
        issues.push({
          issue: 'Fixed height',
          explanation: 'Fixed pixel height can cause overflow',
          viewportImpact: 'Vertical clipping on shorter viewports',
          severity: 'medium',
          correction: 'Use min-height or auto with constraints',
          property: 'height',
          value: h[0],
          lineNumber: i,
          range: new vscode.Range(new vscode.Position(i, unitIndex), new vscode.Position(i, unitIndex + unit.length))
        });
      }
    }
    return issues;
  }
  /**
   * Map lint engine issue to visualizer issue format
   * @private
   * @param {object} issue - Lint engine issue
   * @returns {object} Visualizer issue
   */
  mapToVisualizerIssue(issue) {
    // Map issue names to visualizer types
    const typeMap = {
      'Fixed width': 'fixed-dimensions',
      'Fixed height': 'fixed-dimensions',
      'Fixed box dimensions': 'fixed-dimensions',
      'Fixed minimum dimension': 'fixed-dimensions',
      'Viewport width overflow': 'viewport-overflow',
      'Horizontal overflow risk': 'overflow-horizontal',
      'Cumulative horizontal overflow': 'overflow-horizontal',
      'No-wrap fixed width': 'nowrap-fixed',
      'Non-wrapping fixed flex basis': 'flex-fragility',
      'Flex container without wrap': 'flex-fragility',
      'Rigid flex item': 'flex-fragility',
      'Rigid grid tracks': 'grid-rigidity',
      'Fixed pixel spacing': 'fixed-spacing',
      'Media query instability': 'media-instability',
      'Body overflow masking': 'overflow-masking',
      'Fixed width exceeds breakpoint': 'breakpoint-exceeded',
      'Absolute positioning rigidity': 'absolute-rigidity',
      'Mixed box-sizing': 'box-inconsistency',
    };

    const type = typeMap[issue.issue] || 'fixed-dimensions';
    const category = type.includes('flex') ? 'flex' : 
                     type.includes('grid') ? 'grid' : 
                     type.includes('overflow') ? 'overflow' : 'other';
    
    return {
      type,
      severity: issue.severity || 'medium',
      line: issue.lineNumber || 0,
      selector: issue.selector || 'element',
      property: issue.property || 'width',
      value: issue.value || '600px',
      suggestion: issue.correction || issue.suggestion || 'Use responsive units',
      category,
    };
  }

  /**
   * Convert issues to Diagnostics
   * @param {object[]} issues
   * @param {vscode.TextDocument} document
   * @returns {vscode.Diagnostic[]}
   */
  issuesToDiagnostics(issues, document) {
    console.log(`[BMS-Engine] 🔄 Converting ${issues.length} issues to diagnostics`);
    
    return issues.map((issue, idx) => {
      const severity = this.severityToDiagnosticSeverity(issue.severity);

      // Build a detailed message
      const message = `${issue.issue}\n\n**Explanation:** ${issue.explanation}\n\n**Viewport Impact:** ${issue.viewportImpact}\n\n**Suggestion:** ${issue.correction}`;

      const diagnostic = new vscode.Diagnostic(
        issue.range,
        issue.issue,
        severity
      );

      // Store full details as code
      diagnostic.code = {
        value: issue.issue.toLowerCase().replace(/\s+/g, '-'),
        target: vscode.Uri.parse('https://github.com/mikaelcarrara/box-model-sentinel')
      };

      // Markdown message for hover
      diagnostic.message = message;

      diagnostic.source = 'Box Model Sentinel';

      // Generate and store ASCII visualization in metadata
      try {
        const visualizerIssue = this.mapToVisualizerIssue(issue);
        const visualization = this.visualizer.generate(visualizerIssue);
        
        // Store visualization in diagnostic metadata (custom property)
        diagnostic.visualization = visualization.ascii;
        diagnostic.visualizationData = visualization;
      } catch (error) {
        console.warn(`[BMS-Engine] Failed to generate visualization for issue:`, error);
        // Continue without visualization
      }

      if (idx === 0) {
        console.log(`[BMS-Engine] 📌 Example diagnostic 0: issue="${issue.issue}", line=${issue.lineNumber}, range=[${issue.range.start.line}:${issue.range.start.character} to ${issue.range.end.line}:${issue.range.end.character}]`);
      }

      return diagnostic;
    });
  }

  /**
   * Map severity level to DiagnosticSeverity
   * @param {string} severity
   * @returns {number}
   */
  severityToDiagnosticSeverity(severity) {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return vscode.DiagnosticSeverity.Error;
      case 'medium':
        return vscode.DiagnosticSeverity.Warning;
      case 'low':
        return vscode.DiagnosticSeverity.Information;
      default:
        return vscode.DiagnosticSeverity.Hint;
    }
  }

  // ============ DETECTOR FUNCTIONS ============

  detectFixedDimensions({ parsed }) {
    const issues = [];
    for (const r of parsed.rules) {
      try {
        const sel = String(r.selector || '');
        if (Array.isArray(this.config.ignoreSelectors) && this.config.ignoreSelectors.some(p => sel.toLowerCase().includes(String(p || '').toLowerCase()))) {
          continue;
        }
      } catch (_) {}
      const w = r.declarations['width'];
      const h = r.declarations['height'];
      const mw = r.declarations['min-width'];
      const mh = r.declarations['min-height'];

      if (w && /\b\d+px\b/i.test(w)) {
        const m = /(\d+(?:\.\d+)?)px/i.exec(w);
        const num = m ? parseFloat(m[1]) : NaN;
        if (this.shouldReportFixedValue('width', num)) {
          issues.push({
            issue: 'Fixed width',
            explanation: 'Fixed pixel width reduces responsiveness',
            viewportImpact: 'Constrained layout on smaller viewports',
            severity: 'medium',
            correction: 'Use relative units or max-width',
            property: 'width',
            value: w,
            selector: r.selector
          });
        }
      }

      if (h && /\b\d+px\b/i.test(h)) {
        const m = /(\d+(?:\.\d+)?)px/i.exec(h);
        const num = m ? parseFloat(m[1]) : NaN;
        if (this.shouldReportFixedValue('height', num)) {
          issues.push({
            issue: 'Fixed height',
            explanation: 'Fixed pixel height can cause overflow',
            viewportImpact: 'Vertical clipping on shorter viewports',
            severity: 'medium',
            correction: 'Use min-height or auto with constraints',
            property: 'height',
            value: h,
            selector: r.selector
          });
        }
      }

      if (w && h && /\b\d+px\b/i.test(w) && /\b\d+px\b/i.test(h)) {
        issues.push({
          issue: 'Fixed box dimensions',
          explanation: 'Fixed width and height create rigid boxes',
          viewportImpact: 'Breaks responsive scaling across devices',
          severity: 'critical',
          correction: 'Prefer fluid dimensions with min/max constraints',
          selector: r.selector
        });
      }

      if ((mw && /\b\d+px\b/i.test(mw)) || (mh && /\b\d+px\b/i.test(mh))) {
        issues.push({
          issue: 'Fixed minimum dimension',
          explanation: 'Rigid minimum size blocks content reflow',
          viewportImpact: 'Triggers overflow below threshold viewports',
          severity: 'medium',
          correction: 'Use percentages or clamp with responsive units',
          selector: r.selector
        });
      }
    }
    return issues;
  }

  detectBoxModel({ parsed }) {
    const issues = [];
    let borderBoxCount = 0;
    let contentBoxCount = 0;

    for (const r of parsed.rules) {
      const b = r.declarations['box-sizing'];
      if (!b) continue;
      if (/border-box/i.test(b)) borderBoxCount++;
      if (/content-box/i.test(b)) contentBoxCount++;
    }

    if (borderBoxCount && contentBoxCount) {
      issues.push({
        issue: 'Mixed box-sizing',
        explanation: 'Mixed box-sizing leads to inconsistent sizing calculations',
        viewportImpact: 'Inconsistent widths across components',
        severity: 'medium',
        correction: 'Standardize on border-box for layout consistency',
        selector: '*'
      });
    }

    return issues;
  }

  detectOverflowHorizontal({ parsed }) {
    const issues = [];
    for (const r of parsed.rules) {
      try {
        const sel = String(r.selector || '');
        if (Array.isArray(this.config.ignoreSelectors) && this.config.ignoreSelectors.some(p => sel.toLowerCase().includes(String(p || '').toLowerCase()))) {
          continue;
        }
      } catch (_) {}
      const w = r.declarations['width'];
      const mw = r.declarations['min-width'];
      const ow = r.declarations['overflow-x'];
      const mL = r.declarations['margin-left'];
      const mR = r.declarations['margin-right'];
      const pL = r.declarations['padding-left'];
      const pR = r.declarations['padding-right'];
      const nowrap = r.declarations['white-space'];

      if (ow && /visible/i.test(ow) && ((w && /\b\d+px\b/i.test(w)) || (mw && /\b\d+px\b/i.test(mw)))) {
        issues.push({
          issue: 'Horizontal overflow risk',
          explanation: 'Visible overflow with fixed width can exceed viewport',
          viewportImpact: 'Horizontal scrollbars on small screens',
          severity: 'medium',
          correction: 'Set overflow-x hidden or use max-width',
          selector: r.selector
        });
      }

      const fixedPads = [mL, mR, pL, pR].filter((v) => v && /\b\d+px\b/i.test(v)).length;
      if (fixedPads >= 2 && w && /\b\d+px\b/i.test(w)) {
        issues.push({
          issue: 'Cumulative horizontal overflow',
          explanation: 'Fixed width with fixed paddings can exceed viewport',
          viewportImpact: 'Content clipped or scrolls horizontally',
          severity: 'medium',
          correction: 'Use responsive paddings and width constraints',
          selector: r.selector
        });
      }

      if (nowrap && /nowrap/i.test(nowrap) && ((w && /\b\d+px\b/i.test(w)) || (mw && /\b\d+px\b/i.test(mw)))) {
        issues.push({
          issue: 'No-wrap fixed width',
          explanation: 'No wrapping with fixed width increases overflow risk',
          viewportImpact: 'Text overflows on narrow screens',
          severity: 'low',
          correction: 'Allow wrapping or make width responsive',
          selector: r.selector
        });
      }
    }
    return issues;
  }

  detectMediaConflicts({ parsed }) {
    const issues = [];
    const bySelector = {};

    for (const r of parsed.rules) {
      const sel = r.selector;
      if (!bySelector[sel]) bySelector[sel] = [];
      bySelector[sel].push(r);
    }

    for (const sel of Object.keys(bySelector)) {
      const blocks = bySelector[sel];
      const propsMap = {};

      for (const b of blocks) {
        const cond = b.at && b.at.type === 'media' ? b.at.condition : 'base';
        for (const k of Object.keys(b.declarations)) {
          if (!propsMap[k]) propsMap[k] = [];
          propsMap[k].push({ cond, value: b.declarations[k] });
        }
      }

      for (const k of Object.keys(propsMap)) {
        const entries = propsMap[k];
        const values = new Set(entries.map((e) => e.value));
        if (values.size > 1) {
          issues.push({
            issue: 'Media query instability',
            explanation: 'Property values diverge between base and breakpoints',
            viewportImpact: 'Layout shifts unpredictably across viewports',
            severity: 'medium',
            correction: 'Unify values or constrain ranges to avoid divergence',
            selector: sel
          });
          break;
        }
      }
    }

    return issues;
  }

  detectOverflowMaskBody({ parsed }) {
    const issues = [];
    for (const r of parsed.rules) {
      const sel = r.selector.trim().toLowerCase();
      if (sel === 'body') {
        const ox = r.declarations['overflow-x'];
        if (ox && /hidden/i.test(ox)) {
          issues.push({
            issue: 'Body overflow masking',
            explanation: 'Hiding horizontal overflow can mask structural leaks',
            viewportImpact: 'Content clipped without visible scrollbars',
            severity: 'medium',
            correction: 'Prefer fixing causes; avoid global overflow-x: hidden',
            selector: r.selector
          });
        }
      }
    }
    return issues;
  }

  detectVwWidthRisk({ parsed }) {
    const issues = [];
    for (const r of parsed.rules) {
      const w = r.declarations['width'];
      if (w && /\b100vw\b/i.test(w)) {
        issues.push({
          issue: 'Viewport width overflow',
          explanation: '100vw includes scrollbar width causing overflow',
          viewportImpact: 'Horizontal scroll or clipped edges on desktops',
          severity: 'medium',
          correction: 'Use 100% or calc(100vw - var(scrollbar))',
          selector: r.selector
        });
      }
    }
    return issues;
  }

  detectBreakpointFixedWidth({ parsed }) {
    const issues = [];
    for (const r of parsed.rules) {
      if (!r.at || r.at.type !== 'media') continue;
      const cond = r.at.condition || '';
      const m = cond.match(/(\d+)\s*px/i);
      if (!m) continue;

      const breakpoint = parseInt(m[1], 10);
      const w = r.declarations['width'];
      const px = w && /(\d+)px/i.exec(w);

      if (px) {
        const val = parseInt(px[1], 10);
        if (val > breakpoint) {
          issues.push({
            issue: 'Fixed width exceeds breakpoint',
            explanation: 'Width in px inside max-width media exceeds the breakpoint',
            viewportImpact: 'Guaranteed overflow below breakpoint',
            severity: 'critical',
            correction: 'Use fluid width or cap with max-width ≤ breakpoint',
            selector: r.selector
          });
        }
      }
    }
    return issues;
  }

  detectMediaWidthInstability({ parsed }) {
    const issues = [];
    const baseMap = {};
    const mediaMap = {};

    for (const r of parsed.rules) {
      if (r.at && r.at.type === 'media') {
        const w = r.declarations['width'];
        if (w) {
          if (!mediaMap[r.selector]) mediaMap[r.selector] = [];
          mediaMap[r.selector].push(w);
        }
      } else {
        const w = r.declarations['width'];
        if (w) baseMap[r.selector] = w;
      }
    }

    for (const sel of Object.keys(mediaMap)) {
      const baseW = baseMap[sel];
      const mediaWs = mediaMap[sel];
      if (!baseW) continue;

      const bpx = /(\d+)px/i.exec(baseW);
      for (const mw of mediaWs) {
        const mpx = /(\d+)px/i.exec(mw);
        if (bpx && mpx && bpx[1] !== mpx[1]) {
          issues.push({
            issue: 'Media query instability',
            explanation: 'Fixed px width changes across base and media queries',
            viewportImpact: 'Layout width fluctuates unpredictably',
            severity: 'medium',
            correction: 'Use fluid widths or harmonize breakpoint widths',
            selector: sel
          });
          break;
        }
      }
    }

    return issues;
  }

  detectFlexFragility({ parsed }) {
    const issues = [];
    for (const r of parsed.rules) {
      try {
        const sel = String(r.selector || '');
        if (Array.isArray(this.config.ignoreSelectors) && this.config.ignoreSelectors.some(p => sel.toLowerCase().includes(String(p || '').toLowerCase()))) {
          continue;
        }
      } catch (_) {}
      const d = r.declarations['display'];
      if (!(d && /flex/i.test(d))) continue;

      const wrap = r.declarations['flex-wrap'];
      const basis = r.declarations['flex-basis'];
      const flex = r.declarations['flex'];

      if (wrap && /nowrap/i.test(wrap) && ((basis && /\b\d+px\b/i.test(basis)) || (flex && /\b0\s+0\s+\d+px\b/i.test(flex)))) {
        let num = NaN;
        if (basis) {
          const mm = /(\d+(?:\.\d+)?)px/i.exec(basis);
          if (mm) num = parseFloat(mm[1]);
        } else if (flex) {
          const mm = /\b0\s+0\s+(\d+(?:\.\d+)?)px\b/i.exec(flex);
          if (mm) num = parseFloat(mm[1]);
        }
        if (this.shouldReportFixedValue('flex-basis', num)) {
          issues.push({
            issue: 'Non-wrapping fixed flex basis',
            explanation: 'No wrap with fixed basis causes overflow and rigidity',
            viewportImpact: 'Items overflow container on small screens',
            severity: 'critical',
            correction: 'Enable wrapping or use responsive flex-basis',
            selector: r.selector
          });
        }
      }

      if (!wrap) {
        issues.push({
          issue: 'Flex container without wrap',
          explanation: 'Flex containers default to nowrap, risking overflow',
          viewportImpact: 'Children overflow on narrow screens',
          severity: 'medium',
          correction: 'Set flex-wrap: wrap when widths are rigid',
          selector: r.selector
        });
      }

      const grow = r.declarations['flex-grow'];
      const shrink = r.declarations['flex-shrink'];

      if (grow === '0' && shrink === '0' && basis && /\b\d+px\b/i.test(basis)) {
        const mm = /(\d+(?:\.\d+)?)px/i.exec(basis);
        const num = mm ? parseFloat(mm[1]) : NaN;
        if (this.shouldReportFixedValue('flex-basis', num)) {
          issues.push({
            issue: 'Rigid flex item',
            explanation: 'No growth or shrink with fixed basis reduces flexibility',
            viewportImpact: 'Poor reflow under varying viewport widths',
            severity: 'medium',
            correction: 'Allow shrink or use relative basis',
            selector: r.selector
          });
        }
      }
    }
    return issues;
  }

  detectGridRigidity({ parsed }) {
    const issues = [];
    for (const r of parsed.rules) {
      try {
        const sel = String(r.selector || '');
        if (Array.isArray(this.config.ignoreSelectors) && this.config.ignoreSelectors.some(p => sel.toLowerCase().includes(String(p || '').toLowerCase()))) {
          continue;
        }
      } catch (_) {}
      const d = r.declarations['display'];
      if (!(d && /grid/i.test(d))) continue;

      const tcols = r.declarations['grid-template-columns'];
      const acol = r.declarations['grid-auto-columns'];
      const trows = r.declarations['grid-template-rows'];

      const pxCols = tcols && /\b\d+px\b/.test(tcols);
      const pxRows = trows && /\b\d+px\b/.test(trows);
      const pxAuto = acol && /\b\d+px\b/.test(acol);

      if (pxCols || pxRows || pxAuto) {
        let report = true;
        if ((this.config.mode || 'strict').toLowerCase() === 'pragmatic') {
          const extractNums = (v) => {
            const nums = [];
            if (!v || typeof v !== 'string') return nums;
            const re = /(\d+(?:\.\d+)?)px/ig;
            let m;
            while ((m = re.exec(v)) !== null) nums.push(parseFloat(m[1]));
            return nums;
          };
          const allNums = []
            .concat(extractNums(tcols))
            .concat(extractNums(trows))
            .concat(extractNums(acol));
          report = allNums.some(n => this.shouldReportFixedValue('grid-track', n));
        }
        if (report) {
          issues.push({
            issue: 'Rigid grid tracks',
            explanation: 'Fixed pixel tracks reduce grid adaptability',
            viewportImpact: 'Grid fails to reflow on narrow or wide screens',
            severity: 'medium',
            correction: 'Use fr units or minmax with responsive bounds',
            selector: r.selector
          });
        }
      }
    }
    return issues;
  }

  detectAbsoluteContainment({ parsed }) {
    const issues = [];
    for (const r of parsed.rules) {
      try {
        const sel = String(r.selector || '');
        if (Array.isArray(this.config.ignoreSelectors) && this.config.ignoreSelectors.some(p => sel.toLowerCase().includes(String(p || '').toLowerCase()))) {
          continue;
        }
      } catch (_) {}
      const pos = r.declarations['position'];
      if (!(pos && /absolute/i.test(pos))) continue;

      const left = r.declarations['left'];
      const right = r.declarations['right'];
      const top = r.declarations['top'];
      const bottom = r.declarations['bottom'];
      const w = r.declarations['width'];

      if (
        (left && /\b\d+px\b/i.test(left)) ||
        (right && /\b\d+px\b/i.test(right)) ||
        (top && /\b\d+px\b/i.test(top)) ||
        (bottom && /\b\d+px\b/i.test(bottom)) ||
        (w && /\b\d+px\b/i.test(w))
      ) {
        issues.push({
          issue: 'Absolute positioning rigidity',
          explanation: 'Absolute positions with fixed pixels reduce adaptability',
          viewportImpact: 'Elements misalign under viewport changes',
          severity: 'medium',
          correction: 'Prefer relative offsets or responsive units',
          selector: r.selector
        });
      }
    }
    return issues;
  }

  detectAntiPatterns({ parsed }) {
    const issues = [];
    for (const r of parsed.rules) {
      try {
        const sel = String(r.selector || '');
        if (Array.isArray(this.config.ignoreSelectors) && this.config.ignoreSelectors.some(p => sel.toLowerCase().includes(String(p || '').toLowerCase()))) {
          continue;
        }
      } catch (_) {}
      for (const k of Object.keys(r.declarations)) {
        const v = r.declarations[k];

        if (typeof v === 'string' && /!important/i.test(v) && /^(width|height|margin|padding|left|right|top|bottom|flex|grid)/i.test(k)) {
          issues.push({
            issue: 'Layout property with !important',
            explanation: 'Important flags on layout hinder responsive overrides',
            viewportImpact: 'Difficult to adapt across breakpoints',
            severity: 'low',
            correction: 'Remove !important and use specificity or cascade',
            selector: r.selector
          });
        }

        if (/^(margin|padding|gap)$/i.test(k) && /\b\d+px\b/i.test(v)) {
          const mm = /(\d+(?:\.\d+)?)px/i.exec(v);
          const num = mm ? parseFloat(mm[1]) : NaN;
          if (this.shouldReportFixedValue('spacing', num)) {
            issues.push({
              issue: 'Fixed pixel spacing',
              explanation: 'Fixed spacing can break scaling',
              viewportImpact: 'Compressed or expanded layout across devices',
              severity: 'low',
              correction: 'Use responsive units or clamp',
              selector: r.selector
            });
          }
        }
      }
    }
    return issues;
  }



  /**
   * Cleanup on deactivation
   */
  dispose() {
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }
}

module.exports = { LintEngine };
