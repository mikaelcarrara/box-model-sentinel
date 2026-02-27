const { AsciiVisualizer } = require('../ascii-visualizer/core/visualizer');

/**
 * Map lint engine issue to visualizer issue format
 * @param {object} issue - Lint engine issue
 * @returns {object} Visualizer issue
 */
function mapToVisualizerIssue(issue) {
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
    'Layout property with !important': null, // No visualization for !important
  };

  const type = typeMap[issue.issue];
  
  // If no mapping exists or explicitly null, return null to skip visualization
  if (!type) {
    return null;
  }
  
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

function buildStatsModel(issues, classifier) {
  const counts = { critical: 0, medium: 0, low: 0 };
  const typeCounts = { flex: 0, grid: 0, overflow: 0, other: 0 };
  const visualizer = new AsciiVisualizer();
  
  const getType = (name) => {
    if (classifier && typeof classifier.getType === 'function') {
      return classifier.getType(name);
    }
    const n = String(name || '').toLowerCase();
    if (n.includes('flex') || n.includes('basis')) return 'flex';
    if (n.includes('grid')) return 'grid';
    if (n.includes('overflow') || n.includes('viewport') || n.includes('100vw')) return 'overflow';
    return 'other';
  };
  for (const i of issues || []) {
    const s = String(i.severity || '').toLowerCase();
    if (counts[s] !== undefined) counts[s]++;
    const t = getType(i.issue || '');
    if (typeCounts[t] !== undefined) typeCounts[t]++;
  }
  const items = (issues || []).map((i, idx) => {
    let visualization = null;
    try {
      const visualizerIssue = mapToVisualizerIssue(i);
      // Only generate visualization if mapping exists
      if (visualizerIssue) {
        const viz = visualizer.generate(visualizerIssue);
        visualization = viz.ascii;
      }
    } catch (error) {
      console.warn('Failed to generate visualization for issue:', error);
    }
    
    return {
      idx,
      title: i.issue,
      sev: String(i.severity || '').toLowerCase(),
      line: i.lineNumber,
      type: getType(i.issue || ''),
      explanation: i.explanation || '',
      viewportImpact: i.viewportImpact || '',
      suggestion: i.suggestion || i.correction || '',
      visualization,
    };
  });
  return { counts, typeCounts, items };
}

module.exports = { buildStatsModel };
