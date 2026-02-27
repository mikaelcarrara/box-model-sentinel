/**
 * Demo script to showcase all 12 ASCII visualizers
 */

const { AsciiVisualizer } = require('./core/visualizer');

const visualizer = new AsciiVisualizer();

// Demo issues for each type
const demoIssues = [
  {
    type: 'fixed-dimensions',
    severity: 'critical',
    line: 42,
    selector: '.card',
    property: 'width',
    value: '600px',
    suggestion: 'max-width: 100%',
    category: 'other',
  },
  {
    type: 'viewport-overflow',
    severity: 'critical',
    line: 15,
    selector: '#hero',
    property: 'width',
    value: '1200px',
    suggestion: 'max-width: 100vw',
    category: 'overflow',
  },
  {
    type: 'flex-fragility',
    severity: 'medium',
    line: 28,
    selector: '.flex-container',
    property: 'width',
    value: '300px',
    suggestion: 'flex-wrap: wrap',
    category: 'flex',
  },
  {
    type: 'grid-rigidity',
    severity: 'medium',
    line: 35,
    selector: '.grid',
    property: 'grid-template-columns',
    value: 'repeat(4, 200px)',
    suggestion: 'repeat(auto-fit, minmax(200px, 1fr))',
    category: 'grid',
  },
  {
    type: 'fixed-spacing',
    severity: 'low',
    line: 50,
    selector: '.container',
    property: 'padding',
    value: '40px',
    suggestion: 'clamp(1rem, 5vw, 2.5rem)',
    category: 'other',
  },
  {
    type: 'media-instability',
    severity: 'medium',
    line: 67,
    selector: '.responsive',
    property: 'width',
    value: '768px',
    suggestion: '@media (min-width: 48em)',
    category: 'other',
  },
  {
    type: 'overflow-masking',
    severity: 'critical',
    line: 5,
    selector: 'body',
    property: 'overflow',
    value: 'hidden',
    suggestion: 'overflow: auto',
    category: 'overflow',
  },
  {
    type: 'breakpoint-exceeded',
    severity: 'medium',
    line: 80,
    selector: '.content',
    property: 'width',
    value: '900px',
    suggestion: 'max-width: 100%',
    category: 'other',
  },
  {
    type: 'absolute-rigidity',
    severity: 'low',
    line: 92,
    selector: '.modal',
    property: 'left',
    value: '100px',
    suggestion: 'left: 10%',
    category: 'other',
  },
  {
    type: 'box-inconsistency',
    severity: 'low',
    line: 105,
    selector: '.box',
    property: 'box-sizing',
    value: 'content-box',
    suggestion: 'box-sizing: border-box',
    category: 'other',
  },
  {
    type: 'overflow-horizontal',
    severity: 'critical',
    line: 120,
    selector: '.wide-content',
    property: 'width',
    value: '800px',
    suggestion: 'max-width: 100%',
    category: 'overflow',
  },
  {
    type: 'nowrap-fixed',
    severity: 'medium',
    line: 135,
    selector: '.text',
    property: 'white-space',
    value: 'nowrap',
    suggestion: 'white-space: normal',
    category: 'other',
  },
];

console.log('ASCII Layout Visualizer - Demo\n');
console.log('Showcasing all 12 issue type generators:\n');
console.log('='.repeat(60));

demoIssues.forEach((issue, index) => {
  console.log(`\n${index + 1}. ${issue.type.toUpperCase()}`);
  console.log('-'.repeat(60));
  
  const result = visualizer.generate(issue);
  console.log(result.ascii);
  console.log(`\nGeneration time: ${result.generationTime.toFixed(2)}ms`);
  console.log('='.repeat(60));
});

console.log('\n✅ All 12 generators working successfully!');
console.log(`\nSupported types: ${visualizer.getSupportedTypes().join(', ')}`);
