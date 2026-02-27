/**
 * Integration test for all 12 generators
 * Validates that all issue types can generate visualizations successfully
 */

const { AsciiVisualizer } = require('../core/visualizer');

describe('All Generators Integration', () => {
  let visualizer;

  beforeEach(() => {
    visualizer = new AsciiVisualizer();
  });

  // Test data for each issue type
  const testIssues = [
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

  test('should support all 12 issue types', () => {
    const supportedTypes = visualizer.getSupportedTypes();
    
    expect(supportedTypes).toHaveLength(12);
    expect(supportedTypes).toContain('fixed-dimensions');
    expect(supportedTypes).toContain('viewport-overflow');
    expect(supportedTypes).toContain('flex-fragility');
    expect(supportedTypes).toContain('grid-rigidity');
    expect(supportedTypes).toContain('fixed-spacing');
    expect(supportedTypes).toContain('media-instability');
    expect(supportedTypes).toContain('overflow-masking');
    expect(supportedTypes).toContain('breakpoint-exceeded');
    expect(supportedTypes).toContain('absolute-rigidity');
    expect(supportedTypes).toContain('box-inconsistency');
    expect(supportedTypes).toContain('overflow-horizontal');
    expect(supportedTypes).toContain('nowrap-fixed');
  });

  test('should generate visualization for all issue types', () => {
    testIssues.forEach((issue) => {
      const result = visualizer.generate(issue);
      
      // Should return a valid visualization
      expect(result).toBeDefined();
      expect(result.ascii).toBeDefined();
      expect(typeof result.ascii).toBe('string');
      expect(result.ascii.length).toBeGreaterThan(0);
      
      // Should have dimensions
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
      
      // Should have generation time
      expect(typeof result.generationTime).toBe('number');
      expect(result.generationTime).toBeGreaterThanOrEqual(0);
    });
  });

  test('should include ANTES and DEPOIS labels in all visualizations', () => {
    testIssues.forEach((issue) => {
      const result = visualizer.generate(issue);
      
      expect(result.ascii).toContain('ANTES');
      expect(result.ascii).toContain('DEPOIS');
    });
  });

  test('should include severity emoji in all visualizations', () => {
    testIssues.forEach((issue) => {
      const result = visualizer.generate(issue);
      
      // Should contain one of the severity emojis (minimalist characters)
      const hasSeverityEmoji = 
        result.ascii.includes('✖') || // critical
        result.ascii.includes('⚠') ||  // medium
        result.ascii.includes('ⓘ');    // low
      
      expect(hasSeverityEmoji).toBe(true);
    });
  });

  test('should include status indicators in all visualizations', () => {
    testIssues.forEach((issue) => {
      const result = visualizer.generate(issue);
      
      expect(result.ascii).toContain('✖'); // problem (minimalist X)
      expect(result.ascii).toContain('✓'); // solution (minimalist check)
    });
  });

  test('should include line number in all visualizations', () => {
    testIssues.forEach((issue) => {
      const result = visualizer.generate(issue);
      
      expect(result.ascii).toContain(`L${issue.line}`);
    });
  });

  test('should respect size constraints', () => {
    testIssues.forEach((issue) => {
      const result = visualizer.generate(issue);
      
      // Width should not exceed 60 characters
      const lines = result.ascii.split('\n');
      lines.forEach((line) => {
        expect(line.length).toBeLessThanOrEqual(60);
      });
      
      // Height should not exceed 20 lines
      expect(lines.length).toBeLessThanOrEqual(20);
    });
  });

  test('should generate quickly (under 50ms)', () => {
    testIssues.forEach((issue) => {
      const result = visualizer.generate(issue);
      
      expect(result.generationTime).toBeLessThan(50);
    });
  });

  test('should handle invalid issue gracefully', () => {
    const invalidIssue = {
      type: 'invalid-type',
      // Missing required fields
    };
    
    const result = visualizer.generate(invalidIssue);
    
    expect(result).toBeDefined();
    expect(result.ascii).toContain('Error');
  });

  test('should handle unsupported issue type gracefully', () => {
    const unsupportedIssue = {
      type: 'unsupported-type',
      severity: 'medium',
      line: 1,
      selector: '.test',
      property: 'width',
      value: '100px',
      suggestion: 'test',
      category: 'other',
    };
    
    const result = visualizer.generate(unsupportedIssue);
    
    expect(result).toBeDefined();
    expect(result.ascii).toContain('not available');
  });
});
