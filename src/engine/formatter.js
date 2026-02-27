/**
 * Box Model Sentinel - Message Formatter
 * Formata issues em Markdown/texto estruturado
 */

/**
 * Mapeamento de ícones por severidade
 */
const SEVERITY_ICONS = {
  critical: '🚫',
  medium: '⚠️',
  low: 'ℹ️'
};

/**
 * Formata uma issue em Markdown estruturado para Hover
 * @param {object} issue - Issue detectada
 * @returns {string} Markdown formatado
 */
function formatHoverMessage(issue) {
  const icon = SEVERITY_ICONS[issue.severity.toLowerCase()] || 'ℹ️';
  const title = `${icon} **${issue.severity.toUpperCase()}** ${issue.issue}`;

  const explanation = `**Explicação**\n${highlightUnits(issue.explanation || '')}`;
  const viewportImpact = `**Impacto no Viewport**\n${highlightUnits(issue.viewportImpact || '')}`;
  const suggestion = `**Sugestão**\n${highlightUnits(issue.suggestion || issue.correction || '')}`;

  const separator = '\n\n---\n\n';

  return (
    title +
    separator +
    explanation +
    separator +
    viewportImpact +
    separator +
    suggestion
  );
}


module.exports = {
  formatHoverMessage
};

function highlightUnits(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/(\b\d+(\.\d+)?\s*px\b)/gi, '`$1`')
    .replace(/(\b\d+(\.\d+)?\s*rem\b)/gi, '`$1`')
    .replace(/(\b\d+(\.\d+)?\s*vw\b)/gi, '`$1`')
    .replace(/(\bpx\b|\brem\b|\bvw\b)/gi, '`$1`');
}
