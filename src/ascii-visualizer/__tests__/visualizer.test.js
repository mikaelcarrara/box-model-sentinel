/**
 * Tests for AsciiVisualizer and GeneratorRegistry
 */

const { AsciiVisualizer, GeneratorRegistry } = require('../core/visualizer');
const BaseGenerator = require('../generators/base-generator');

// Mock generator for testing
class MockGenerator extends BaseGenerator {
  supports(issueType) {
    return issueType === 'test-type';
  }

  generate(issue) {
    return {
      ascii: 'mock visualization',
      width: 18,
      height: 1,
      generationTime: 0,
    };
  }
}

describe('GeneratorRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new GeneratorRegistry();
  });

  test('registers and retrieves generators', () => {
    const generator = new MockGenerator();
    registry.register('test-type', generator);
    
    expect(registry.get('test-type')).toBe(generator);
  });

  test('checks if type is registered', () => {
    const generator = new MockGenerator();
    registry.register('test-type', generator);
    
    expect(registry.has('test-type')).toBe(true);
    expect(registry.has('other-type')).toBe(false);
  });

  test('returns undefined for unregistered types', () => {
    expect(registry.get('nonexistent')).toBeUndefined();
  });

  test('returns all generators', () => {
    const gen1 = new MockGenerator();
    const gen2 = new MockGenerator();
    
    registry.register('type1', gen1);
    registry.register('type2', gen2);
    
    const all = registry.getAll();
    expect(all).toHaveLength(2);
    expect(all).toContain(gen1);
    expect(all).toContain(gen2);
  });
});

describe('AsciiVisualizer', () => {
  let visualizer;

  beforeEach(() => {
    visualizer = new AsciiVisualizer();
  });

  test('generates fallback for unsupported types', () => {
    const issue = {
      type: 'unsupported-type',
      severity: 'critical',
      line: 10,
      selector: '.test',
      property: 'width',
      value: '600px',
      suggestion: 'Use max-width',
      category: 'other',
    };
    
    const result = visualizer.generate(issue);
    
    expect(result.ascii).toContain('unsupported-type');
    expect(result.ascii).toContain('not available');
  });

  test('generates error visualization for invalid input', () => {
    const invalidIssue = {
      type: 'test',
      // Missing required fields
    };
    
    const result = visualizer.generate(invalidIssue);
    
    expect(result.ascii).toContain('Error');
    expect(result.ascii).toContain('Invalid issue data');
  });

  test('uses registered generator', () => {
    const generator = new MockGenerator();
    visualizer.registerGenerator('test-type', generator);
    
    const issue = {
      type: 'test-type',
      severity: 'critical',
      line: 10,
      selector: '.test',
      property: 'width',
      value: '600px',
      suggestion: 'Use max-width',
      category: 'other',
    };
    
    const result = visualizer.generate(issue);
    
    expect(result.ascii).toBe('mock visualization');
  });

  test('tracks generation time', () => {
    const generator = new MockGenerator();
    visualizer.registerGenerator('test-type', generator);
    
    const issue = {
      type: 'test-type',
      severity: 'critical',
      line: 10,
      selector: '.test',
      property: 'width',
      value: '600px',
      suggestion: 'Use max-width',
      category: 'other',
    };
    
    const result = visualizer.generate(issue);
    
    expect(result.generationTime).toBeGreaterThanOrEqual(0);
  });

  test('returns supported types', () => {
    const generator = new MockGenerator();
    visualizer.registerGenerator('test-type', generator);
    
    const types = visualizer.getSupportedTypes();
    
    expect(types).toContain('test-type');
  });

  test('handles generator errors gracefully', () => {
    class ErrorGenerator extends BaseGenerator {
      supports(issueType) {
        return issueType === 'error-type';
      }

      generate(issue) {
        throw new Error('Test error');
      }
    }
    
    visualizer.registerGenerator('error-type', new ErrorGenerator());
    
    const issue = {
      type: 'error-type',
      severity: 'critical',
      line: 10,
      selector: '.test',
      property: 'width',
      value: '600px',
      suggestion: 'Use max-width',
      category: 'other',
    };
    
    const result = visualizer.generate(issue);
    
    expect(result.ascii).toContain('Error');
    expect(result.ascii).toContain('Generation failed');
  });
});
