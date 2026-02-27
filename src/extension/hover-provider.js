/**
 * Box Model Sentinel - HoverProvider
 * Exibe mensagens ricas ao passar o mouse sobre problemas CSS
 */

const vscode = require('vscode');
const { formatHoverMessage } = require('../engine/formatter');
const { AsciiVisualizer } = require('../ascii-visualizer/core/visualizer');

class HoverProvider {
  /**
   * @param {Map<string, object[]>} issuesCache - Cache de issues por URI
   */
  constructor(issuesCache) {
    this.issuesCache = issuesCache;
    this.visualizer = new AsciiVisualizer();
  }

  /**
   * Implementar vscode.HoverProvider.provideHover
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @param {vscode.CancellationToken} token
   * @returns {vscode.Hover | null}
   */
  provideHover(document, position, token) {
    const uri = document.uri.toString();
    const issues = this.issuesCache.get(uri);

    if (!issues || issues.length === 0) {
      return null;
    }

    const line = position.line;
    const character = position.character;

    // Procurar por issue na linha atual
    for (const issue of issues) {
      if (issue.lineNumber === line) {
        // Verificar se o cursor está dentro do range da issue
        if (
          character >= issue.range.start.character &&
          character <= issue.range.end.character
        ) {
          // Formatar mensagem em Markdown
          const markdownContent = formatHoverMessage(issue);
          const markdown = new vscode.MarkdownString(markdownContent);

          // Generate ASCII visualization
          try {
            const visualizerIssue = this.mapToVisualizerIssue(issue);
            const visualization = this.visualizer.generate(visualizerIssue);
            
            // For now, use plain ASCII in code block
            // VS Code markdown sanitizes inline styles, so we'll enhance this later
            markdown.appendMarkdown('\n\n---\n\n**Visualização**\n\n');
            markdown.appendCodeblock(visualization.ascii, 'text');
          } catch (error) {
            console.warn('Failed to generate visualization:', error);
            // Continue without visualization
          }

          // Permitir markdown e links
          markdown.isTrusted = true;
          markdown.supportHtml = true;

          // Retornar Hover com a mensagem
          return new vscode.Hover(markdown);
        }
      }
    }

    return null;
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
      'Media query instability': 'media-instability',
      'Absolute positioning rigidity': 'absolute-rigidity',
      'Mixed box-sizing': 'box-inconsistency',
    };

    const type = typeMap[issue.issue] || 'fixed-dimensions';
    
    return {
      type,
      severity: issue.severity || 'medium',
      line: issue.lineNumber || 0,
      selector: issue.selector || 'element',
      property: issue.property || 'width',
      value: issue.value || '600px',
      suggestion: issue.correction || issue.suggestion || 'Use responsive units',
      category: this.getCategoryFromType(type),
    };
  }

  /**
   * Get category from issue type
   * @private
   * @param {string} type - Issue type
   * @returns {string} Category
   */
  getCategoryFromType(type) {
    if (type.includes('flex')) return 'flex';
    if (type.includes('grid')) return 'grid';
    if (type.includes('overflow')) return 'overflow';
    return 'other';
  }

  /**
   * Registrar este provider no editor
   * @param {vscode.ExtensionContext} context
   * @static
   */
  static register(context, issuesCache) {
    const provider = new HoverProvider(issuesCache);

    const registration = vscode.languages.registerHoverProvider(
      ['css', 'scss'],
      provider
    );

    context.subscriptions.push(registration);
    return provider;
  }
}

module.exports = { HoverProvider };
