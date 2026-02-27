/**
 * ASCII Visualizer - Main Entry Point
 * 
 * Orchestrates visualization generation by managing generator registry,
 * handling errors, and monitoring performance.
 */

const { TemplateEngine } = require('./template-engine');

/**
 * @typedef {import('../types').Issue} Issue
 * @typedef {import('../types').Visualization} Visualization
 * @typedef {import('../types').IssueType} IssueType
 */

/**
 * Generator Registry for managing issue type generators
 */
class GeneratorRegistry {
  constructor() {
    /** @type {Map<IssueType, import('../generators/base-generator')>} */
    this.generators = new Map();
  }

  /**
   * Register a generator for an issue type
   * 
   * @param {IssueType} type - Issue type
   * @param {import('../generators/base-generator')} generator - Generator instance
   */
  register(type, generator) {
    this.generators.set(type, generator);
  }

  /**
   * Get generator for issue type
   * 
   * @param {IssueType} type - Issue type
   * @returns {import('../generators/base-generator')|undefined} Generator or undefined
   */
  get(type) {
    return this.generators.get(type);
  }

  /**
   * Check if issue type has a registered generator
   * 
   * @param {IssueType} type - Issue type
   * @returns {boolean} True if generator exists
   */
  has(type) {
    return this.generators.has(type);
  }

  /**
   * Get all registered generators
   * 
   * @returns {import('../generators/base-generator')[]} Array of generators
   */
  getAll() {
    return Array.from(this.generators.values());
  }
}

/**
 * Main ASCII Visualizer class
 */
class AsciiVisualizer {
  constructor() {
    this.registry = new GeneratorRegistry();
    this.templateEngine = new TemplateEngine();
    this.generatorFactories = new Map();
    this.generatorInstances = new Map();
    this.registerGeneratorFactories();
  }

  /**
   * Generate ASCII visualization for an issue
   * 
   * @param {Issue} issue - Issue data
   * @returns {Visualization} Generated visualization
   */
  generate(issue) {
    const startTime = performance.now();
    
    // Validate input
    if (!this.isValidIssue(issue)) {
      return this.generateErrorVisualization('Invalid issue data');
    }
    
    // Lazy instantiate generator
    if (!this.generatorInstances.has(issue.type)) {
      const factory = this.generatorFactories.get(issue.type);
      if (factory) {
        this.generatorInstances.set(issue.type, factory());
      }
    }
    
    // Get generator
    const generator = this.generatorInstances.get(issue.type);
    if (!generator) {
      return this.generateFallback(issue);
    }
    
    try {
      const result = generator.generate(issue);
      result.generationTime = performance.now() - startTime;
      
      // Log slow generations
      if (result.generationTime > 30) {
        console.warn(`Slow generation for ${issue.type}: ${result.generationTime}ms`);
      }
      
      return result;
    } catch (error) {
      console.error(`Generation failed for ${issue.type}:`, error);
      return this.generateErrorVisualization(`Generation failed: ${error.message}`);
    }
  }

  /**
   * Register a custom generator
   * 
   * @param {IssueType} type - Issue type
   * @param {import('../generators/base-generator')} generator - Generator instance
   */
  registerGenerator(type, generator) {
    this.generatorInstances.set(type, generator);
  }

  /**
   * Get list of supported issue types
   * 
   * @returns {IssueType[]} Array of supported types
   */
  getSupportedTypes() {
    // Combine factory types and manually registered types
    const factoryTypes = Array.from(this.generatorFactories.keys());
    const instanceTypes = Array.from(this.generatorInstances.keys());
    
    // Merge and deduplicate
    return [...new Set([...factoryTypes, ...instanceTypes])];
  }

  /**
   * Register all built-in generator factories (lazy initialization)
   * @private
   */
  registerGeneratorFactories() {
    // Register factory functions instead of instances
    this.generatorFactories.set('fixed-dimensions', () => {
      const FixedDimensionsGenerator = require('../generators/fixed-dimensions');
      return new FixedDimensionsGenerator(this.templateEngine);
    });
    
    this.generatorFactories.set('viewport-overflow', () => {
      const ViewportOverflowGenerator = require('../generators/viewport-overflow');
      return new ViewportOverflowGenerator(this.templateEngine);
    });
    
    this.generatorFactories.set('flex-fragility', () => {
      const FlexFragilityGenerator = require('../generators/flex-fragility');
      return new FlexFragilityGenerator(this.templateEngine);
    });
    
    this.generatorFactories.set('grid-rigidity', () => {
      const GridRigidityGenerator = require('../generators/grid-rigidity');
      return new GridRigidityGenerator(this.templateEngine);
    });
    
    this.generatorFactories.set('fixed-spacing', () => {
      const FixedSpacingGenerator = require('../generators/fixed-spacing');
      return new FixedSpacingGenerator(this.templateEngine);
    });
    
    this.generatorFactories.set('media-instability', () => {
      const MediaInstabilityGenerator = require('../generators/media-instability');
      return new MediaInstabilityGenerator(this.templateEngine);
    });
    
    this.generatorFactories.set('overflow-masking', () => {
      const OverflowMaskingGenerator = require('../generators/overflow-masking');
      return new OverflowMaskingGenerator(this.templateEngine);
    });
    
    this.generatorFactories.set('breakpoint-exceeded', () => {
      const BreakpointExceededGenerator = require('../generators/breakpoint-exceeded');
      return new BreakpointExceededGenerator(this.templateEngine);
    });
    
    this.generatorFactories.set('absolute-rigidity', () => {
      const AbsoluteRigidityGenerator = require('../generators/absolute-rigidity');
      return new AbsoluteRigidityGenerator(this.templateEngine);
    });
    
    this.generatorFactories.set('box-inconsistency', () => {
      const BoxInconsistencyGenerator = require('../generators/box-inconsistency');
      return new BoxInconsistencyGenerator(this.templateEngine);
    });
    
    this.generatorFactories.set('overflow-horizontal', () => {
      const OverflowHorizontalGenerator = require('../generators/overflow-horizontal');
      return new OverflowHorizontalGenerator(this.templateEngine);
    });
    
    this.generatorFactories.set('nowrap-fixed', () => {
      const NowrapFixedGenerator = require('../generators/nowrap-fixed');
      return new NowrapFixedGenerator(this.templateEngine);
    });
  }

  /**
   * Validate issue data
   * @private
   * @param {Issue} issue - Issue to validate
   * @returns {boolean} True if valid
   */
  isValidIssue(issue) {
    return !!(
      issue &&
      issue.type &&
      issue.severity &&
      typeof issue.line === 'number' &&
      issue.selector &&
      issue.property &&
      issue.value
    );
  }

  /**
   * Generate fallback visualization for unsupported types
   * @private
   * @param {Issue} issue - Issue data
   * @returns {Visualization} Fallback visualization
   */
  generateFallback(issue) {
    const ascii = `[${issue.type}] visualization not available`;
    return {
      ascii,
      width: ascii.length,
      height: 1,
      generationTime: 0,
    };
  }

  /**
   * Generate error visualization
   * @private
   * @param {string} message - Error message
   * @returns {Visualization} Error visualization
   */
  generateErrorVisualization(message) {
    const lines = [
      '┌────────────────────────────────────────────────────────┐',
      '│ ⚠️  Visualization Error                                │',
      '├────────────────────────────────────────────────────────┤',
      `│ ${this.padLine(message, 56)} │`,
      '└────────────────────────────────────────────────────────┘',
    ];
    
    const ascii = lines.join('\n');
    
    return {
      ascii,
      width: 60,
      height: 5,
      generationTime: 0,
    };
  }

  /**
   * Pad line to specified width
   * @private
   * @param {string} text - Text to pad
   * @param {number} width - Target width
   * @returns {string} Padded text
   */
  padLine(text, width) {
    if (text.length >= width) {
      return text.substring(0, width - 1) + '…';
    }
    return text + ' '.repeat(width - text.length);
  }
}

module.exports = {
  GeneratorRegistry,
  AsciiVisualizer,
};
