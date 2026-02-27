/**
 * Tests for TemplateEngine and TemplateCache
 */

const { TemplateCache, TemplateEngine } = require('../core/template-engine');

describe('TemplateCache', () => {
  let cache;

  beforeEach(() => {
    cache = new TemplateCache(3); // Small size for testing
  });

  test('stores and retrieves values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  test('returns undefined for missing keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  test('checks key existence', () => {
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  test('evicts oldest entry when at capacity', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    cache.set('key4', 'value4'); // Should evict key1
    
    expect(cache.has('key1')).toBe(false);
    expect(cache.has('key2')).toBe(true);
    expect(cache.has('key3')).toBe(true);
    expect(cache.has('key4')).toBe(true);
  });

  test('updates position on get (LRU)', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    
    // Access key1 to make it most recent
    cache.get('key1');
    
    // Add key4, should evict key2 (oldest)
    cache.set('key4', 'value4');
    
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
    expect(cache.has('key3')).toBe(true);
    expect(cache.has('key4')).toBe(true);
  });

  test('clears all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    cache.clear();
    
    expect(cache.has('key1')).toBe(false);
    expect(cache.has('key2')).toBe(false);
  });

  test('generates cache key from issue', () => {
    const issue = {
      type: 'fixed-dimensions',
      severity: 'critical',
      value: '600px',
    };
    
    const key = cache.generateKey(issue);
    expect(key).toBe('fixed-dimensions:critical:600px');
  });
});

describe('TemplateEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new TemplateEngine();
  });

  test('renders and caches result', () => {
    const issue = {
      type: 'fixed-dimensions',
      severity: 'critical',
      value: '600px',
    };
    
    let callCount = 0;
    const renderFn = () => {
      callCount++;
      return 'rendered output';
    };
    
    // First call should execute renderFn
    const result1 = engine.render(issue, renderFn);
    expect(result1).toBe('rendered output');
    expect(callCount).toBe(1);
    
    // Second call should use cache
    const result2 = engine.render(issue, renderFn);
    expect(result2).toBe('rendered output');
    expect(callCount).toBe(1); // Not incremented
  });

  test('clears cache', () => {
    const issue = {
      type: 'fixed-dimensions',
      severity: 'critical',
      value: '600px',
    };
    
    let callCount = 0;
    const renderFn = () => {
      callCount++;
      return 'rendered output';
    };
    
    engine.render(issue, renderFn);
    expect(callCount).toBe(1);
    
    engine.clearCache();
    
    // After clearing, should execute renderFn again
    engine.render(issue, renderFn);
    expect(callCount).toBe(2);
  });

  test('provides access to cache', () => {
    const cache = engine.getCache();
    expect(cache).toBeInstanceOf(TemplateCache);
  });
});
