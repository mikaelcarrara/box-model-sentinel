# ASCII Layout Visualizer - Design Document

## 1. Overview

The ASCII Layout Visualizer is a pure TypeScript/JavaScript module that generates compact, text-based visual representations of CSS box model issues. It transforms diagnostic data into "BEFORE vs AFTER" ASCII art miniatures that help developers quickly understand layout problems and their solutions.

The system uses a template-based architecture where each of the 12 supported issue types has a dedicated generator function. These generators use a consistent visual vocabulary (box-drawing characters and emojis) to create standardized visualizations that fit within strict size constraints (60 chars width, 20 lines height).

Key design principles:
- **Performance-first**: Sub-50ms generation time through template caching and efficient string building
- **Extensibility**: Plugin-style architecture for adding new issue type visualizers
- **Consistency**: Shared visual vocabulary and layout structure across all issue types
- **Accessibility**: Plain text output with semantic structure for screen readers

## 2. Architecture

### 2.1 Module Structure

```
ascii-visualizer/
├── core/
│   ├── visualizer.ts          # Main entry point and orchestrator
│   ├── template-engine.ts     # Template rendering and caching
│   └── character-palette.ts   # Visual vocabulary constants
├── generators/
│   ├── base-generator.ts      # Abstract base class for all generators
│   ├── fixed-dimensions.ts    # Fixed width/height visualizer
│   ├── viewport-overflow.ts   # Viewport overflow visualizer
│   ├── flex-fragility.ts      # Flex layout visualizer
│   ├── grid-rigidity.ts       # Grid layout visualizer
│   ├── fixed-spacing.ts       # Spacing/padding visualizer
│   ├── media-instability.ts   # Media query visualizer
│   ├── overflow-masking.ts    # Body overflow visualizer
│   ├── breakpoint-exceeded.ts # Breakpoint visualizer
│   ├── absolute-rigidity.ts   # Absolute positioning visualizer
│   ├── box-inconsistency.ts   # Box model visualizer
│   ├── overflow-horizontal.ts # Horizontal overflow visualizer
│   └── nowrap-fixed.ts        # No-wrap visualizer
├── utils/
│   ├── layout-calculator.ts   # Proportional sizing calculations
│   ├── text-formatter.ts      # Text truncation and alignment
│   └── viewport-scaler.ts     # Viewport size scaling
└── types/
    └── index.ts               # TypeScript interfaces
```

### 2.2 Data Flow

```
Issue Data (from diagnostics)
    ↓
Visualizer.generate(issue)
    ↓
Generator Registry (select appropriate generator)
    ↓
Specific Generator (e.g., FixedDimensionsGenerator)
    ↓
Template Engine (render with data)
    ↓
ASCII Art String (output)
```

### 2.3 Component Responsibilities

**Visualizer (core/visualizer.ts)**
- Main API entry point
- Generator registry and selection
- Performance monitoring
- Error handling and fallbacks

**Template Engine (core/template-engine.ts)**
- Template string interpolation
- Template caching
- Line wrapping and truncation
- Border and box drawing

**Base Generator (generators/base-generator.ts)**
- Common layout logic
- Header/footer rendering
- BEFORE/AFTER structure
- Severity emoji selection

**Specific Generators (generators/*.ts)**
- Issue-specific visualization logic
- Custom layout calculations
- Property-specific rendering
- Viewport-specific handling

## 3. Components and Interfaces

### 3.1 Core Interfaces

```typescript
// Input interface (from requirements)
interface Issue {
  type: IssueType;
  severity: Severity;
  line: number;
  selector: string;
  property: string;
  value: string;
  suggestion: string;
  category: Category;
}

type IssueType = 
  | 'fixed-dimensions'
  | 'viewport-overflow'
  | 'flex-fragility'
  | 'grid-rigidity'
  | 'fixed-spacing'
  | 'media-instability'
  | 'overflow-masking'
  | 'breakpoint-exceeded'
  | 'absolute-rigidity'
  | 'box-inconsistency'
  | 'overflow-horizontal'
  | 'nowrap-fixed';

type Severity = 'critical' | 'medium' | 'low';
type Category = 'flex' | 'grid' | 'overflow' | 'other';

// Output interface
interface Visualization {
  ascii: string;           // The complete ASCII art
  width: number;           // Actual width in characters
  height: number;          // Actual height in lines
  generationTime: number;  // Time taken in ms
}

// Generator interface
interface IGenerator {
  generate(issue: Issue): Visualization;
  supports(issueType: IssueType): boolean;
}

// Template data interface
interface TemplateData {
  header: HeaderData;
  before: LayoutData;
  after: LayoutData;
  footer?: FooterData;
}

interface HeaderData {
  type: string;
  severity: string;
  severityEmoji: string;
  line: number;
}

interface LayoutData {
  label: string;
  statusEmoji: string;
  content: string[];      // Array of lines
  measurements: string;   // e.g., "600px width"
}

interface FooterData {
  viewports?: ViewportData[];
  notes?: string[];
}

interface ViewportData {
  label: string;          // "Mobile 375px" or "Desktop 1920px"
  visualization: string[];
}
```

### 3.2 Character Palette

```typescript
// core/character-palette.ts
export const CHARS = {
  // Content
  SOLID: '█',
  MEDIUM: '▓',
  LIGHT: '░',
  
  // Borders
  H_LINE: '─',
  V_LINE: '│',
  TOP_LEFT: '┌',
  TOP_RIGHT: '┐',
  BOTTOM_LEFT: '└',
  BOTTOM_RIGHT: '┘',
  
  // Indicators
  DOWN: '▼',
  RIGHT: '►',
  LEFT: '◄',
  ELLIPSIS: '…',
  ARROW: '→',
  
  // Spacing
  SPACE: ' ',
  DOT: '•',
} as const;

export const EMOJI = {
  // Severity
  CRITICAL: '🚫',
  MEDIUM: '⚠️',
  LOW: 'ℹ️',
  
  // Status
  PROBLEM: '❌',
  SOLUTION: '✅',
  ARROW: '→',
} as const;
```

### 3.3 Visualizer API

```typescript
// core/visualizer.ts
export class AsciiVisualizer {
  private generators: Map<IssueType, IGenerator>;
  private templateEngine: TemplateEngine;
  
  constructor() {
    this.generators = new Map();
    this.templateEngine = new TemplateEngine();
    this.registerGenerators();
  }
  
  /**
   * Generate ASCII visualization for an issue
   */
  generate(issue: Issue): Visualization {
    const startTime = performance.now();
    
    const generator = this.generators.get(issue.type);
    if (!generator) {
      return this.generateFallback(issue);
    }
    
    const result = generator.generate(issue);
    result.generationTime = performance.now() - startTime;
    
    return result;
  }
  
  /**
   * Register a custom generator
   */
  registerGenerator(type: IssueType, generator: IGenerator): void {
    this.generators.set(type, generator);
  }
  
  /**
   * Get list of supported issue types
   */
  getSupportedTypes(): IssueType[] {
    return Array.from(this.generators.keys());
  }
  
  private registerGenerators(): void {
    // Register all 12 built-in generators
    this.registerGenerator('fixed-dimensions', new FixedDimensionsGenerator(this.templateEngine));
    this.registerGenerator('viewport-overflow', new ViewportOverflowGenerator(this.templateEngine));
    // ... register remaining 10 generators
  }
  
  private generateFallback(issue: Issue): Visualization {
    // Simple fallback for unsupported types
    const ascii = `[${issue.type}] visualization not available`;
    return {
      ascii,
      width: ascii.length,
      height: 1,
      generationTime: 0,
    };
  }
}
```

### 3.4 Base Generator

```typescript
// generators/base-generator.ts
export abstract class BaseGenerator implements IGenerator {
  protected templateEngine: TemplateEngine;
  protected maxWidth = 60;
  protected maxHeight = 20;
  
  constructor(templateEngine: TemplateEngine) {
    this.templateEngine = templateEngine;
  }
  
  abstract generate(issue: Issue): Visualization;
  abstract supports(issueType: IssueType): boolean;
  
  /**
   * Render standard header
   */
  protected renderHeader(data: HeaderData): string[] {
    const title = `${data.type.toUpperCase()} ${CHARS.DOT} ${data.severityEmoji} ${CHARS.DOT} L${data.line}`;
    const padding = this.maxWidth - 2;
    
    return [
      CHARS.TOP_LEFT + CHARS.H_LINE.repeat(padding) + CHARS.TOP_RIGHT,
      CHARS.V_LINE + this.pad(title, padding) + CHARS.V_LINE,
      CHARS.V_LINE + CHARS.H_LINE.repeat(padding) + CHARS.V_LINE,
    ];
  }
  
  /**
   * Render BEFORE/AFTER comparison
   */
  protected renderComparison(before: LayoutData, after: LayoutData): string[] {
    const lines: string[] = [];
    const halfWidth = Math.floor((this.maxWidth - 2) / 2);
    
    // Labels line
    const labelLine = this.pad(`  ${before.label}`, halfWidth) + 
                     EMOJI.ARROW + 
                     this.pad(`${after.label}`, halfWidth - 1);
    lines.push(CHARS.V_LINE + labelLine + CHARS.V_LINE);
    
    // Content lines (side by side)
    const maxLines = Math.max(before.content.length, after.content.length);
    for (let i = 0; i < maxLines; i++) {
      const beforeLine = this.pad(before.content[i] || '', halfWidth);
      const afterLine = this.pad(after.content[i] || '', halfWidth);
      lines.push(CHARS.V_LINE + beforeLine + ' ' + afterLine + CHARS.V_LINE);
    }
    
    // Measurements line
    const measureLine = this.pad(`  ${before.statusEmoji} ${before.measurements}`, halfWidth) +
                       ' ' +
                       this.pad(`${after.statusEmoji} ${after.measurements}`, halfWidth);
    lines.push(CHARS.V_LINE + measureLine + CHARS.V_LINE);
    
    return lines;
  }
  
  /**
   * Render footer with border
   */
  protected renderFooter(): string[] {
    const padding = this.maxWidth - 2;
    return [
      CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(padding) + CHARS.BOTTOM_RIGHT,
    ];
  }
  
  /**
   * Pad string to specified width
   */
  protected pad(text: string, width: number, align: 'left' | 'center' | 'right' = 'left'): string {
    const textLength = this.visualLength(text);
    if (textLength >= width) {
      return this.truncate(text, width);
    }
    
    const padding = width - textLength;
    
    switch (align) {
      case 'center':
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
      case 'right':
        return ' '.repeat(padding) + text;
      default:
        return text + ' '.repeat(padding);
    }
  }
  
  /**
   * Calculate visual length (emojis count as 2)
   */
  protected visualLength(text: string): number {
    // Count emojis as 2 characters for visual alignment
    const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    return text.length + emojiCount;
  }
  
  /**
   * Truncate text with ellipsis
   */
  protected truncate(text: string, maxLength: number): string {
    if (this.visualLength(text) <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 1) + CHARS.ELLIPSIS;
  }
  
  /**
   * Get severity emoji
   */
  protected getSeverityEmoji(severity: Severity): string {
    switch (severity) {
      case 'critical': return EMOJI.CRITICAL;
      case 'medium': return EMOJI.MEDIUM;
      case 'low': return EMOJI.LOW;
    }
  }
}
```

### 3.5 Example Generator: Fixed Dimensions

```typescript
// generators/fixed-dimensions.ts
export class FixedDimensionsGenerator extends BaseGenerator {
  supports(issueType: IssueType): boolean {
    return issueType === 'fixed-dimensions';
  }
  
  generate(issue: Issue): Visualization {
    const lines: string[] = [];
    
    // Header
    const headerData: HeaderData = {
      type: 'Fixed Dimensions',
      severity: issue.severity,
      severityEmoji: this.getSeverityEmoji(issue.severity),
      line: issue.line,
    };
    lines.push(...this.renderHeader(headerData));
    
    // BEFORE: Fixed width box
    const fixedWidth = this.extractPixelValue(issue.value) || 600;
    const containerWidth = 400; // Assume viewport is smaller
    const beforeContent = this.renderFixedBox(fixedWidth, containerWidth);
    
    const before: LayoutData = {
      label: 'ANTES',
      statusEmoji: EMOJI.PROBLEM,
      content: beforeContent,
      measurements: `${issue.property}: ${issue.value}`,
    };
    
    // AFTER: Responsive width
    const afterContent = this.renderResponsiveBox(containerWidth);
    
    const after: LayoutData = {
      label: 'DEPOIS',
      statusEmoji: EMOJI.SOLUTION,
      content: afterContent,
      measurements: issue.suggestion,
    };
    
    // Comparison
    lines.push(...this.renderComparison(before, after));
    
    // Footer
    lines.push(...this.renderFooter());
    
    const ascii = lines.join('\n');
    return {
      ascii,
      width: this.maxWidth,
      height: lines.length,
      generationTime: 0, // Set by visualizer
    };
  }
  
  private renderFixedBox(elementWidth: number, containerWidth: number): string[] {
    const scale = 20; // Scale factor for visualization
    const boxWidth = Math.floor(elementWidth / scale);
    const viewportWidth = Math.floor(containerWidth / scale);
    
    const overflow = boxWidth > viewportWidth;
    const visibleWidth = Math.min(boxWidth, viewportWidth);
    const overflowWidth = overflow ? boxWidth - viewportWidth : 0;
    
    const lines: string[] = [];
    
    // Container border
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(viewportWidth) + CHARS.TOP_RIGHT);
    
    // Content with overflow indicator
    let contentLine = '  ' + CHARS.V_LINE + CHARS.SOLID.repeat(visibleWidth);
    if (overflow) {
      contentLine += CHARS.MEDIUM.repeat(Math.min(overflowWidth, 3)) + CHARS.RIGHT;
    } else {
      contentLine += CHARS.V_LINE;
    }
    lines.push(contentLine);
    
    // Container border
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(viewportWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }
  
  private renderResponsiveBox(containerWidth: number): string[] {
    const scale = 20;
    const boxWidth = Math.floor(containerWidth / scale);
    
    const lines: string[] = [];
    
    // Container border
    lines.push('  ' + CHARS.TOP_LEFT + CHARS.H_LINE.repeat(boxWidth) + CHARS.TOP_RIGHT);
    
    // Content fits perfectly
    lines.push('  ' + CHARS.V_LINE + CHARS.SOLID.repeat(boxWidth) + CHARS.V_LINE);
    
    // Container border
    lines.push('  ' + CHARS.BOTTOM_LEFT + CHARS.H_LINE.repeat(boxWidth) + CHARS.BOTTOM_RIGHT);
    
    return lines;
  }
  
  private extractPixelValue(value: string): number | null {
    const match = value.match(/(\d+)px/);
    return match ? parseInt(match[1], 10) : null;
  }
}
```

## 4. Data Models

### 4.1 Generator Registry

```typescript
// Internal data structure for managing generators
class GeneratorRegistry {
  private generators: Map<IssueType, IGenerator>;
  
  register(type: IssueType, generator: IGenerator): void {
    this.generators.set(type, generator);
  }
  
  get(type: IssueType): IGenerator | undefined {
    return this.generators.get(type);
  }
  
  has(type: IssueType): boolean {
    return this.generators.has(type);
  }
  
  getAll(): IGenerator[] {
    return Array.from(this.generators.values());
  }
}
```

### 4.2 Template Cache

```typescript
// Template caching for performance
class TemplateCache {
  private cache: Map<string, string>;
  private maxSize: number;
  
  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  get(key: string): string | undefined {
    return this.cache.get(key);
  }
  
  set(key: string, value: string): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (first in map)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  
  has(key: string): boolean {
    return this.cache.has(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  generateKey(issue: Issue): string {
    return `${issue.type}:${issue.severity}:${issue.value}`;
  }
}
```

### 4.3 Layout Calculations

```typescript
// Utility for proportional sizing
interface Dimensions {
  width: number;
  height: number;
}

interface ScaledDimensions extends Dimensions {
  scale: number;
  overflow: boolean;
}

class LayoutCalculator {
  /**
   * Scale pixel values to character counts
   */
  scaleToChars(pixels: number, maxChars: number, maxPixels: number): number {
    const ratio = pixels / maxPixels;
    return Math.floor(ratio * maxChars);
  }
  
  /**
   * Calculate proportional dimensions
   */
  calculateProportions(
    elementSize: number,
    containerSize: number,
    maxChars: number
  ): ScaledDimensions {
    const scale = maxChars / containerSize;
    const scaledElement = Math.floor(elementSize * scale);
    const scaledContainer = maxChars;
    
    return {
      width: Math.min(scaledElement, scaledContainer),
      height: 3, // Standard box height
      scale,
      overflow: scaledElement > scaledContainer,
    };
  }
  
  /**
   * Parse CSS value to pixels
   */
  parseValue(value: string): number | null {
    // Handle px
    const pxMatch = value.match(/^(\d+(?:\.\d+)?)px$/);
    if (pxMatch) return parseFloat(pxMatch[1]);
    
    // Handle vw (assume 1920px viewport)
    const vwMatch = value.match(/^(\d+(?:\.\d+)?)vw$/);
    if (vwMatch) return (parseFloat(vwMatch[1]) / 100) * 1920;
    
    // Handle % (relative to container, assume 1200px)
    const pctMatch = value.match(/^(\d+(?:\.\d+)?)%$/);
    if (pctMatch) return (parseFloat(pctMatch[1]) / 100) * 1200;
    
    return null;
  }
}
```


## 5. Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Size Constraints
*For any* generated visualization, the width must not exceed 60 characters and the height must not exceed 20 lines.
**Validates: Requirements 2.1.2**

### Property 2: BEFORE/AFTER Structure
*For any* generated visualization, it must contain both "ANTES" and "DEPOIS" labels indicating the before and after states.
**Validates: Requirements 2.1.3**

### Property 3: Character Palette Compliance
*For any* generated visualization, all characters used must be from the defined character palette (box-drawing characters: █▓░─│┌┐└┘, indicators: ▼►◄…→, emojis: 🚫⚠️ℹ️❌✅, and standard ASCII).
**Validates: Requirements 2.1.4**

### Property 4: Viewport Visualization
*For any* issue of type viewport-overflow or media-instability, the generated visualization must include viewport size labels (e.g., "Mobile 375px", "Desktop 1920px").
**Validates: Requirements 2.2.1, 2.2.3**

### Property 5: Overflow Indicators
*For any* issue involving overflow (viewport-overflow, overflow-horizontal, overflow-masking), the visualization must contain overflow indicator characters (▓ or ►).
**Validates: Requirements 2.2.2**

### Property 6: Severity Emoji Mapping
*For any* issue, the visualization must contain the correct severity emoji: 🚫 for critical, ⚠️ for medium, ℹ️ for low.
**Validates: Requirements 2.3.1, 2.3.2, 2.3.3**

### Property 7: Status Indicators
*For any* generated visualization, the BEFORE section must contain ❌ and the AFTER section must contain ✅.
**Validates: Requirements 2.3.4**

### Property 8: Input Data Preservation
*For any* issue, the generated visualization must contain both the original CSS value (e.g., "600px") and the suggested fix from the input data.
**Validates: Requirements 2.4.1, 2.4.2**

### Property 9: Line Numbers in Header
*For any* generated visualization, the header must contain the line number from the input issue in the format "L{number}".
**Validates: Requirements 2.4.4**

### Property 10: Output Format
*For any* generated visualization, the output must be a plain text string with newline characters and must not contain ANSI color codes.
**Validates: Requirements 3.5**

### Property 11: Performance Constraint
*For any* issue, the generation time must be less than 50 milliseconds.
**Validates: Requirements 4.1**

## 6. Error Handling

### 6.1 Invalid Input Handling

```typescript
class AsciiVisualizer {
  generate(issue: Issue): Visualization {
    // Validate input
    if (!this.isValidIssue(issue)) {
      return this.generateErrorVisualization('Invalid issue data');
    }
    
    // Handle unsupported issue types
    if (!this.generators.has(issue.type)) {
      return this.generateFallback(issue);
    }
    
    try {
      return this.generators.get(issue.type)!.generate(issue);
    } catch (error) {
      return this.generateErrorVisualization(`Generation failed: ${error.message}`);
    }
  }
  
  private isValidIssue(issue: Issue): boolean {
    return !!(
      issue.type &&
      issue.severity &&
      typeof issue.line === 'number' &&
      issue.selector &&
      issue.property &&
      issue.value
    );
  }
  
  private generateErrorVisualization(message: string): Visualization {
    const ascii = [
      '┌────────────────────────────────────────────────────────┐',
      '│ ⚠️  Visualization Error                                │',
      '├────────────────────────────────────────────────────────┤',
      `│ ${this.pad(message, 56)} │`,
      '└────────────────────────────────────────────────────────┘',
    ].join('\n');
    
    return {
      ascii,
      width: 60,
      height: 5,
      generationTime: 0,
    };
  }
}
```

### 6.2 Graceful Degradation

**Missing Data**: If optional fields are missing, use sensible defaults:
- Missing `suggestion`: Use generic "Use responsive units"
- Missing `selector`: Use "element"
- Missing `category`: Use "other"

**Parse Failures**: If CSS value parsing fails:
- Display the raw value as-is
- Use generic box representation
- Log warning for debugging

**Overflow Handling**: If content exceeds size limits:
- Truncate with ellipsis (…)
- Prioritize critical information (header, status)
- Maintain structural integrity

### 6.3 Performance Safeguards

```typescript
class AsciiVisualizer {
  private readonly TIMEOUT_MS = 50;
  
  generate(issue: Issue): Visualization {
    const startTime = performance.now();
    
    // Set timeout guard
    const timeoutId = setTimeout(() => {
      throw new Error('Generation timeout exceeded');
    }, this.TIMEOUT_MS);
    
    try {
      const result = this.generators.get(issue.type)!.generate(issue);
      clearTimeout(timeoutId);
      
      result.generationTime = performance.now() - startTime;
      
      // Log slow generations
      if (result.generationTime > 30) {
        console.warn(`Slow generation for ${issue.type}: ${result.generationTime}ms`);
      }
      
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
```

## 7. Testing Strategy

### 7.1 Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and error conditions
- Test each of the 12 issue type generators with concrete examples
- Test error handling paths (invalid input, missing data)
- Test edge cases (empty strings, extreme values, special characters)
- Test integration points (template engine, character palette)

**Property-Based Tests**: Verify universal properties across all inputs
- Generate random issues with various types, severities, and values
- Verify properties hold for all generated inputs (100+ iterations per test)
- Catch edge cases that manual testing might miss
- Validate correctness properties defined in section 5

### 7.2 Property-Based Testing Configuration

**Library Selection**: Use `fast-check` for TypeScript property-based testing

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test must reference its design document property
- Tag format: `// Feature: ascii-visualizer, Property {number}: {property_text}`

**Example Property Test**:
```typescript
import fc from 'fast-check';

// Feature: ascii-visualizer, Property 1: Size Constraints
test('generated visualizations respect size constraints', () => {
  fc.assert(
    fc.property(
      fc.record({
        type: fc.constantFrom(...ALL_ISSUE_TYPES),
        severity: fc.constantFrom('critical', 'medium', 'low'),
        line: fc.integer({ min: 1, max: 10000 }),
        selector: fc.string({ minLength: 1, maxLength: 50 }),
        property: fc.constantFrom('width', 'height', 'padding', 'margin'),
        value: fc.string({ minLength: 1, maxLength: 20 }),
        suggestion: fc.string({ minLength: 1, maxLength: 100 }),
        category: fc.constantFrom('flex', 'grid', 'overflow', 'other'),
      }),
      (issue) => {
        const visualizer = new AsciiVisualizer();
        const result = visualizer.generate(issue);
        
        // Count actual width and height
        const lines = result.ascii.split('\n');
        const width = Math.max(...lines.map(line => line.length));
        const height = lines.length;
        
        expect(width).toBeLessThanOrEqual(60);
        expect(height).toBeLessThanOrEqual(20);
      }
    ),
    { numRuns: 100 }
  );
});
```

### 7.3 Unit Test Coverage

**Core Components**:
- `AsciiVisualizer`: Test generator registration, selection, fallback behavior
- `TemplateEngine`: Test template rendering, caching, interpolation
- `BaseGenerator`: Test header/footer rendering, padding, truncation
- Each specific generator: Test with concrete examples for that issue type

**Utilities**:
- `LayoutCalculator`: Test scaling, proportion calculations, value parsing
- `TextFormatter`: Test truncation, alignment, visual length calculation
- `ViewportScaler`: Test viewport size calculations

**Edge Cases**:
- Empty strings
- Very long strings (> 1000 chars)
- Special characters (emojis, unicode)
- Extreme numeric values (0, negative, very large)
- Missing optional fields
- Invalid issue types

### 7.4 Integration Testing

**VS Code Integration**:
- Test hover provider displays visualization correctly
- Test stats panel renders visualization
- Test diagnostic metadata includes visualization
- Test copy-to-clipboard functionality

**Performance Testing**:
- Benchmark generation time for each issue type
- Test with 1000 consecutive generations
- Verify no memory leaks
- Test cache effectiveness

### 7.5 Test Data Generators

```typescript
// Generators for property-based testing
const issueArbitrary = fc.record({
  type: fc.constantFrom<IssueType>(
    'fixed-dimensions',
    'viewport-overflow',
    'flex-fragility',
    'grid-rigidity',
    'fixed-spacing',
    'media-instability',
    'overflow-masking',
    'breakpoint-exceeded',
    'absolute-rigidity',
    'box-inconsistency',
    'overflow-horizontal',
    'nowrap-fixed'
  ),
  severity: fc.constantFrom<Severity>('critical', 'medium', 'low'),
  line: fc.integer({ min: 1, max: 10000 }),
  selector: fc.oneof(
    fc.constant('.card'),
    fc.constant('#hero'),
    fc.constant('div.container'),
    fc.string({ minLength: 1, maxLength: 30 })
  ),
  property: fc.constantFrom('width', 'height', 'padding', 'margin', 'max-width'),
  value: fc.oneof(
    fc.nat({ max: 2000 }).map(n => `${n}px`),
    fc.nat({ max: 100 }).map(n => `${n}vw`),
    fc.nat({ max: 100 }).map(n => `${n}%`)
  ),
  suggestion: fc.string({ minLength: 10, maxLength: 100 }),
  category: fc.constantFrom<Category>('flex', 'grid', 'overflow', 'other'),
});
```

## 8. Integration Points

### 8.1 Hover Provider Integration

```typescript
// In hover-provider.ts
import { AsciiVisualizer } from './ascii-visualizer';

class BoxModelHoverProvider implements vscode.HoverProvider {
  private visualizer: AsciiVisualizer;
  
  constructor() {
    this.visualizer = new AsciiVisualizer();
  }
  
  provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | null {
    const issue = this.getIssueAtPosition(document, position);
    if (!issue) return null;
    
    // Generate visualization
    const visualization = this.visualizer.generate(issue);
    
    // Create markdown content
    const markdown = new vscode.MarkdownString();
    markdown.appendMarkdown(`### ${issue.type}\n\n`);
    markdown.appendMarkdown(`${issue.suggestion}\n\n`);
    markdown.appendCodeblock(visualization.ascii, 'text');
    
    return new vscode.Hover(markdown);
  }
}
```

### 8.2 Stats Panel Integration

```typescript
// In stats-panel.ts
class StatsPanel {
  private visualizer: AsciiVisualizer;
  
  renderIssueCard(issue: Issue): string {
    const visualization = this.visualizer.generate(issue);
    
    return `
      <div class="issue-card">
        <div class="issue-header">
          <span class="severity">${issue.severity}</span>
          <span class="type">${issue.type}</span>
        </div>
        <pre class="visualization">${this.escapeHtml(visualization.ascii)}</pre>
        <div class="issue-actions">
          <button onclick="copyVisualization('${this.escapeForJs(visualization.ascii)}')">
            Copy
          </button>
        </div>
      </div>
    `;
  }
}
```

### 8.3 Diagnostic Metadata

```typescript
// Store visualization in diagnostic metadata
function createDiagnostic(issue: Issue): vscode.Diagnostic {
  const visualizer = new AsciiVisualizer();
  const visualization = visualizer.generate(issue);
  
  const diagnostic = new vscode.Diagnostic(
    range,
    issue.suggestion,
    vscode.DiagnosticSeverity.Warning
  );
  
  // Store in metadata for later retrieval
  diagnostic.code = {
    value: issue.type,
    target: vscode.Uri.parse('https://docs.example.com/issues/' + issue.type),
  };
  
  // Custom metadata (not standard VS Code API, but useful for extension)
  (diagnostic as any).visualization = visualization.ascii;
  (diagnostic as any).visualizationData = visualization;
  
  return diagnostic;
}
```

## 9. Performance Optimizations

### 9.1 Template Caching

```typescript
class TemplateEngine {
  private cache: TemplateCache;
  
  render(issue: Issue): string {
    const cacheKey = this.cache.generateKey(issue);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    // Generate and cache
    const result = this.renderInternal(issue);
    this.cache.set(cacheKey, result);
    
    return result;
  }
}
```

### 9.2 Lazy Generator Initialization

```typescript
class AsciiVisualizer {
  private generators: Map<IssueType, () => IGenerator>;
  private instances: Map<IssueType, IGenerator>;
  
  constructor() {
    this.generators = new Map();
    this.instances = new Map();
    this.registerGeneratorFactories();
  }
  
  private registerGeneratorFactories(): void {
    // Register factory functions instead of instances
    this.generators.set('fixed-dimensions', () => new FixedDimensionsGenerator(this.templateEngine));
    this.generators.set('viewport-overflow', () => new ViewportOverflowGenerator(this.templateEngine));
    // ... etc
  }
  
  generate(issue: Issue): Visualization {
    // Lazy instantiation
    if (!this.instances.has(issue.type)) {
      const factory = this.generators.get(issue.type);
      if (factory) {
        this.instances.set(issue.type, factory());
      }
    }
    
    const generator = this.instances.get(issue.type);
    return generator ? generator.generate(issue) : this.generateFallback(issue);
  }
}
```

### 9.3 String Building Optimization

```typescript
class BaseGenerator {
  // Use array joining instead of string concatenation
  protected buildVisualization(parts: string[][]): string {
    return parts.map(lines => lines.join('\n')).join('\n');
  }
  
  // Pre-allocate arrays for known sizes
  protected renderComparison(before: LayoutData, after: LayoutData): string[] {
    const maxLines = Math.max(before.content.length, after.content.length);
    const lines: string[] = new Array(maxLines + 2); // +2 for labels and measurements
    
    let index = 0;
    lines[index++] = this.renderLabels(before.label, after.label);
    
    for (let i = 0; i < maxLines; i++) {
      lines[index++] = this.renderContentLine(before.content[i], after.content[i]);
    }
    
    lines[index++] = this.renderMeasurements(before, after);
    
    return lines;
  }
}
```

## 10. Future Enhancements

### 10.1 Animation Support

For future interactive mode, prepare data structures:

```typescript
interface AnimatedVisualization extends Visualization {
  frames: string[];        // Array of ASCII frames
  frameDuration: number;   // Ms per frame
  loop: boolean;          // Whether to loop animation
}

// Example: Animate transition from BEFORE to AFTER
class AnimatedGenerator extends BaseGenerator {
  generateAnimated(issue: Issue): AnimatedVisualization {
    const frames: string[] = [];
    
    // Frame 0: BEFORE state
    frames.push(this.renderBefore(issue));
    
    // Frames 1-8: Transition
    for (let i = 1; i <= 8; i++) {
      frames.push(this.renderTransition(issue, i / 8));
    }
    
    // Frame 9: AFTER state
    frames.push(this.renderAfter(issue));
    
    return {
      ascii: frames[0],
      width: 60,
      height: 20,
      generationTime: 0,
      frames,
      frameDuration: 100,
      loop: false,
    };
  }
}
```

### 10.2 Custom Themes

```typescript
interface VisualizationTheme {
  characters: typeof CHARS;
  emojis: typeof EMOJI;
  colors?: {
    critical: string;
    medium: string;
    low: string;
  };
}

class AsciiVisualizer {
  private theme: VisualizationTheme;
  
  setTheme(theme: VisualizationTheme): void {
    this.theme = theme;
    // Regenerate cached templates with new theme
    this.templateEngine.clearCache();
  }
}
```

### 10.3 Export Formats

```typescript
interface ExportOptions {
  format: 'svg' | 'png' | 'markdown' | 'html';
  scale?: number;
  backgroundColor?: string;
}

class VisualizationExporter {
  export(visualization: Visualization, options: ExportOptions): string | Buffer {
    switch (options.format) {
      case 'svg':
        return this.toSVG(visualization, options);
      case 'png':
        return this.toPNG(visualization, options);
      case 'markdown':
        return this.toMarkdown(visualization);
      case 'html':
        return this.toHTML(visualization, options);
    }
  }
  
  private toSVG(visualization: Visualization, options: ExportOptions): string {
    // Convert ASCII to SVG using <text> elements
    // Each character becomes a positioned text element
    // Monospace font ensures alignment
  }
}
```

## 11. Accessibility Considerations

### 11.1 Screen Reader Support

```typescript
interface AccessibleVisualization extends Visualization {
  altText: string;         // Human-readable description
  ariaLabel: string;       // ARIA label for screen readers
  semanticStructure: {     // Structured data for assistive tech
    problemType: string;
    severity: string;
    before: string;
    after: string;
    recommendation: string;
  };
}

class BaseGenerator {
  protected generateAltText(issue: Issue): string {
    return `${issue.severity} severity ${issue.type} issue on line ${issue.line}. ` +
           `Current value: ${issue.value}. ` +
           `Suggested fix: ${issue.suggestion}`;
  }
}
```

### 11.2 Semantic HTML Wrapper

```typescript
// For webview rendering
function wrapVisualizationForAccessibility(viz: AccessibleVisualization): string {
  return `
    <figure role="img" aria-label="${viz.ariaLabel}">
      <pre aria-hidden="true">${viz.ascii}</pre>
      <figcaption class="sr-only">${viz.altText}</figcaption>
    </figure>
  `;
}
```

---

**Design Status**: Draft  
**Version**: 1.0  
**Last Updated**: 2024-01-15  
**Reviewers**: TBD
