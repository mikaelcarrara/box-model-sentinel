/**
 * Integration Examples for AsciiToHtmlRenderer
 * Shows how to use the renderer in different contexts
 */

const { AsciiToHtmlRenderer } = require('./ascii-to-html-renderer');
const { AsciiVisualizer } = require('../core/visualizer');

// ============================================
// Example 1: Basic Usage
// ============================================

function basicExample() {
  const renderer = new AsciiToHtmlRenderer();
  
  const ascii = `┌──────────┐
│ Content  │
└──────────┘`;

  const html = renderer.render(ascii);
  const styles = renderer.getStyles();

  console.log('HTML:', html);
  console.log('Styles length:', styles.length);
}

// ============================================
// Example 2: Integration with AsciiVisualizer
// ============================================

function visualizerIntegration() {
  // Generate ASCII visualization
  const visualizer = new AsciiVisualizer();
  const issue = {
    type: 'fixed-dimensions',
    severity: 'medium',
    line: 42,
    selector: '.card',
    property: 'width',
    value: '600px',
    suggestion: 'Use max-width: 100% instead',
    category: 'other',
  };

  const visualization = visualizer.generate(issue);
  
  // Render to HTML
  const renderer = new AsciiToHtmlRenderer({
    theme: 'dark',
    enableCopyButton: true,
  });

  const html = renderer.render(visualization.ascii);
  const styles = renderer.getStyles();

  return { html, styles };
}

// ============================================
// Example 3: VS Code Hover Provider Integration
// ============================================

function hoverProviderExample(vscode) {
  class EnhancedHoverProvider {
    constructor(issuesCache) {
      this.issuesCache = issuesCache;
      this.visualizer = new AsciiVisualizer();
      this.renderer = new AsciiToHtmlRenderer({
        theme: 'dark',
        enableCopyButton: false, // No copy button in hover
        enableTooltips: true,
      });
    }

    provideHover(document, position) {
      const issue = this.getIssueAtPosition(document, position);
      if (!issue) return null;

      // Generate ASCII visualization
      const visualization = this.visualizer.generate(issue);

      // Convert to HTML
      const html = this.renderer.render(visualization.ascii);
      const styles = this.renderer.getStyles();

      // Create markdown with HTML
      const markdown = new vscode.MarkdownString();
      markdown.supportHtml = true;
      markdown.isTrusted = true;

      // Add text explanation
      markdown.appendMarkdown(`### ${issue.type}\n\n`);
      markdown.appendMarkdown(`${issue.suggestion}\n\n`);
      
      // Add styled visualization
      markdown.appendMarkdown(`<style>${styles}</style>${html}`);

      return new vscode.Hover(markdown);
    }

    getIssueAtPosition(document, position) {
      // Implementation depends on your issue cache structure
      const uri = document.uri.toString();
      const issues = this.issuesCache.get(uri) || [];
      
      return issues.find(issue => 
        issue.lineNumber === position.line
      );
    }
  }

  return EnhancedHoverProvider;
}

// ============================================
// Example 4: Webview Panel Integration
// ============================================

function webviewPanelExample(vscode, context) {
  function createVisualizationPanel(issue) {
    const panel = vscode.window.createWebviewPanel(
      'asciiVisualization',
      'CSS Layout Visualization',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    // Generate visualization
    const visualizer = new AsciiVisualizer();
    const visualization = visualizer.generate(issue);

    // Render to HTML
    const renderer = new AsciiToHtmlRenderer({
      theme: 'dark',
      enableCopyButton: true,
      enableHover: true,
    });

    const html = renderer.render(visualization.ascii);
    const styles = renderer.getStyles();

    // Set webview HTML
    panel.webview.html = getWebviewContent(html, styles);

    return panel;
  }

  function getWebviewContent(html, styles) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <title>ASCII Visualization</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    h1 {
      font-size: 18px;
      margin-bottom: 16px;
      color: #cccccc;
    }
    
    ${styles}
  </style>
</head>
<body>
  <h1>CSS Layout Visualization</h1>
  ${html}
</body>
</html>`;
  }

  return { createVisualizationPanel };
}

// ============================================
// Example 5: Stats Panel Integration
// ============================================

function statsPanelIntegration(issues) {
  const visualizer = new AsciiVisualizer();
  const renderer = new AsciiToHtmlRenderer({
    theme: 'dark',
    enableCopyButton: true,
  });

  // Generate HTML for all issues
  const visualizations = issues.map(issue => {
    const viz = visualizer.generate(issue);
    return {
      issue,
      html: renderer.render(viz.ascii),
    };
  });

  // Build stats panel HTML
  const styles = renderer.getStyles();
  
  const issueCards = visualizations.map(({ issue, html }) => `
    <div class="issue-card">
      <div class="issue-header">
        <span class="severity ${issue.severity}">${issue.severity}</span>
        <span class="type">${issue.type}</span>
        <span class="line">Line ${issue.line}</span>
      </div>
      <div class="issue-visualization">
        ${html}
      </div>
      <div class="issue-suggestion">
        ${issue.suggestion}
      </div>
    </div>
  `).join('');

  return `
    <style>
      ${styles}
      
      .issue-card {
        margin-bottom: 24px;
        border: 1px solid #3e3e42;
        border-radius: 6px;
        overflow: hidden;
      }
      
      .issue-header {
        padding: 12px;
        background: #2d2d30;
        display: flex;
        gap: 12px;
        align-items: center;
      }
      
      .severity {
        padding: 4px 8px;
        border-radius: 3px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
      }
      
      .severity.critical {
        background: #f48771;
        color: #1e1e1e;
      }
      
      .severity.medium {
        background: #dcdcaa;
        color: #1e1e1e;
      }
      
      .severity.low {
        background: #4ec9b0;
        color: #1e1e1e;
      }
      
      .type {
        color: #cccccc;
        font-size: 13px;
      }
      
      .line {
        color: #858585;
        font-size: 12px;
        margin-left: auto;
      }
      
      .issue-visualization {
        padding: 16px;
        background: #1e1e1e;
      }
      
      .issue-suggestion {
        padding: 12px;
        background: #252526;
        color: #cccccc;
        font-size: 13px;
        border-top: 1px solid #3e3e42;
      }
    </style>
    
    <div class="stats-panel">
      ${issueCards}
    </div>
  `;
}

// ============================================
// Example 6: Dynamic Theme Switching
// ============================================

function dynamicThemeExample(vscode) {
  let currentRenderer = new AsciiToHtmlRenderer({ theme: 'dark' });

  // Listen to theme changes
  vscode.window.onDidChangeActiveColorTheme((theme) => {
    const newTheme = theme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'light';
    currentRenderer.setTheme(newTheme);
    
    // Trigger re-render
    updateAllVisualizations();
  });

  function updateAllVisualizations() {
    // Re-render all visible visualizations with new theme
    const styles = currentRenderer.getStyles();
    // Update webviews, hovers, etc.
  }

  return { currentRenderer, updateAllVisualizations };
}

// ============================================
// Example 7: Performance Monitoring
// ============================================

function performanceMonitoringExample() {
  const renderer = new AsciiToHtmlRenderer();
  const visualizer = new AsciiVisualizer();

  function renderWithMetrics(issue) {
    const startTotal = performance.now();

    // Generate ASCII
    const startAscii = performance.now();
    const visualization = visualizer.generate(issue);
    const asciiTime = performance.now() - startAscii;

    // Render to HTML
    const startHtml = performance.now();
    const html = renderer.render(visualization.ascii);
    const htmlTime = performance.now() - startHtml;

    const totalTime = performance.now() - startTotal;

    console.log('Performance Metrics:');
    console.log(`  ASCII Generation: ${asciiTime.toFixed(2)}ms`);
    console.log(`  HTML Rendering: ${htmlTime.toFixed(2)}ms`);
    console.log(`  Total Time: ${totalTime.toFixed(2)}ms`);

    return { html, metrics: { asciiTime, htmlTime, totalTime } };
  }

  return renderWithMetrics;
}

// ============================================
// Example 8: Batch Rendering
// ============================================

function batchRenderingExample(issues) {
  const visualizer = new AsciiVisualizer();
  const renderer = new AsciiToHtmlRenderer();

  // Get styles once for all visualizations
  const styles = renderer.getStyles();

  // Render all issues
  const results = issues.map(issue => {
    const visualization = visualizer.generate(issue);
    const html = renderer.render(visualization.ascii);
    
    return {
      issue,
      html,
      generationTime: visualization.generationTime,
    };
  });

  return { styles, results };
}

// ============================================
// Export Examples
// ============================================

module.exports = {
  basicExample,
  visualizerIntegration,
  hoverProviderExample,
  webviewPanelExample,
  statsPanelIntegration,
  dynamicThemeExample,
  performanceMonitoringExample,
  batchRenderingExample,
};
