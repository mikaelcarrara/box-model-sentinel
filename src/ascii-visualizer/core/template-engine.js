/**
 * Template Engine and Caching
 * 
 * Provides template rendering with caching for performance optimization.
 * Uses LRU (Least Recently Used) cache eviction strategy.
 */

/**
 * LRU Cache for template results
 */
class TemplateCache {
  /**
   * @param {number} maxSize - Maximum number of cached entries
   */
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Get cached value
   * 
   * @param {string} key - Cache key
   * @returns {string|undefined} Cached value or undefined
   */
  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }

  /**
   * Set cache value
   * 
   * @param {string} key - Cache key
   * @param {string} value - Value to cache
   */
  set(key, value) {
    // Remove if already exists (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }

  /**
   * Check if key exists in cache
   * 
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Clear all cached entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Generate cache key from issue data
   * 
   * @param {import('../types').Issue} issue - Issue object
   * @returns {string} Cache key
   */
  generateKey(issue) {
    return `${issue.type}:${issue.severity}:${issue.value}`;
  }
}

/**
 * Template Engine for rendering visualizations
 */
class TemplateEngine {
  constructor() {
    this.cache = new TemplateCache();
  }

  /**
   * Render template with data (with caching)
   * 
   * @param {import('../types').Issue} issue - Issue data
   * @param {Function} renderFn - Function that generates the visualization
   * @returns {string} Rendered ASCII art
   */
  render(issue, renderFn) {
    const cacheKey = this.cache.generateKey(issue);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Generate and cache
    const result = renderFn(issue);
    this.cache.set(cacheKey, result);
    
    return result;
  }

  /**
   * Clear template cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache instance (for testing)
   * 
   * @returns {TemplateCache} Cache instance
   */
  getCache() {
    return this.cache;
  }
}

module.exports = {
  TemplateCache,
  TemplateEngine,
};
