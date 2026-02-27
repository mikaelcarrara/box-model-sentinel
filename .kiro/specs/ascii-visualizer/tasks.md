# Implementation Plan: ASCII Layout Visualizer

## Overview

This implementation plan breaks down the ASCII Layout Visualizer into incremental, testable steps following a bottom-up strategy. The approach establishes core utilities and the template engine first, then builds the base generator infrastructure, implements all 12 specific issue type generators, and finally integrates with VS Code extension points.

The implementation uses TypeScript and includes both unit tests for specific examples and property-based tests (using fast-check) for universal correctness properties. Each property test runs a minimum of 100 iterations to ensure comprehensive coverage.

## Tasks

- [x] 1. Set up project structure and core types
  - Create `ascii-visualizer/` directory structure: `core/`, `generators/`, `utils/`, `types/`
  - Define TypeScript interfaces in `types/index.ts` (Issue, Visualization, IGenerator, TemplateData, HeaderData, LayoutData, FooterData, ViewportData, IssueType, Severity, Category)
  - Create character palette constants in `core/character-palette.ts` (CHARS and EMOJI objects with all required characters and emojis)
  - Set up test infrastructure with Jest and fast-check for property-based testing
  - _Requirements: 3.2, 3.4, 3.5_

- [x] 1.1 Write property test for character palette compliance
  - **Property 3: Character Palette Compliance**
  - Generate random visualizations and verify all characters are from defined palette (box-drawing, indicators, emojis, ASCII)
  - Tag: `// Feature: ascii-visualizer, Property 3: Character Palette Compliance`
  - **Validates: Requirements 2.1.4**

- [x] 2. Implement core utilities
  - [x] 2.1 Implement LayoutCalculator in `utils/layout-calculator.ts`
    - Write `scaleToChars()` for pixel-to-character conversion with configurable max values
    - Write `calculateProportions()` for proportional sizing with overflow detection
    - Write `parseValue()` for CSS value parsing (px, vw, %, rem, em) with null return for invalid values
    - _Requirements: 2.4.1, 2.4.3_
  
  - [x] 2.2 Write unit tests for LayoutCalculator
    - Test pixel value parsing (600px, 100vw, 50%, 2rem, 1.5em)
    - Test edge cases (0px, negative values, invalid formats like "abc", very large values > 10000px)
    - Test proportion calculations with various container sizes (375px, 768px, 1920px)
    - Test overflow detection accuracy (element > container)
    - _Requirements: 2.4.1_
  
  - [x] 2.3 Implement TextFormatter in `utils/text-formatter.ts`
    - Write `pad()` for text alignment (left, center, right) with configurable width
    - Write `truncate()` with ellipsis (…) support
    - Write `visualLength()` to handle emoji width (count emojis as 2 chars for alignment)
    - _Requirements: 2.1.2_
  
  - [x] 2.4 Write unit tests for TextFormatter
    - Test padding with various alignments (left, center, right) and widths
    - Test truncation at different lengths with ellipsis
    - Test visual length calculation with emojis (🚫⚠️ℹ️❌✅) and special characters
    - Test edge cases (empty strings, strings with only emojis, very long strings > 1000 chars)
    - _Requirements: 2.1.2_
  
  - [x] 2.5 Implement ViewportScaler in `utils/viewport-scaler.ts`
    - Write viewport size calculation methods for mobile (375px) and desktop (1920px)
    - Write scaling logic for responsive visualizations across viewports
    - _Requirements: 2.2.1, 2.2.3_

- [x] 3. Implement template engine and caching
  - [x] 3.1 Create TemplateCache class in `core/template-engine.ts`
    - Implement LRU cache with configurable max size (default 100)
    - Write `generateKey()` for cache key creation from issue data (type:severity:value format)
    - Write `get()`, `set()`, `has()`, `clear()` methods
    - Implement LRU eviction when max size exceeded (remove oldest entry)
    - _Requirements: 4.1, 4.3.1_
  
  - [x] 3.2 Create TemplateEngine class in `core/template-engine.ts`
    - Implement template rendering with string interpolation
    - Integrate TemplateCache for performance optimization
    - Add line wrapping and truncation support using TextFormatter
    - Implement `render()` method with cache check and fallback
    - _Requirements: 4.1, 4.3.1_
  
  - [x] 3.3 Write unit tests for template caching
    - Test cache hit/miss behavior with same and different issues
    - Test LRU eviction when max size exceeded (verify oldest removed)
    - Test cache key generation uniqueness for different issue combinations
    - Test cache clearing functionality
    - _Requirements: 4.1_

- [x] 4. Implement base generator infrastructure
  - [x] 4.1 Create BaseGenerator abstract class in `generators/base-generator.ts`
    - Implement `renderHeader()` with severity emoji, type, and line number (format: "TYPE • EMOJI • L{line}")
    - Implement `renderComparison()` for side-by-side BEFORE/AFTER layout with labels "ANTES" and "DEPOIS"
    - Implement `renderFooter()` with bottom border using box-drawing characters
    - Implement helper methods: `pad()`, `visualLength()`, `truncate()`, `getSeverityEmoji()`
    - Set maxWidth=60 and maxHeight=20 as class constants
    - Add abstract methods: `generate()` and `supports()`
    - _Requirements: 2.1.2, 2.1.3, 2.3.1, 2.3.2, 2.3.3, 2.3.4, 2.4.4_
  
  - [x] 4.2 Write property test for BEFORE/AFTER structure
    - **Property 2: BEFORE/AFTER Structure**
    - Generate random issues of all types and verify all visualizations contain "ANTES" and "DEPOIS" labels
    - Tag: `// Feature: ascii-visualizer, Property 2: BEFORE/AFTER Structure`
    - **Validates: Requirements 2.1.3**
  
  - [x] 4.3 Write property test for severity emoji mapping
    - **Property 6: Severity Emoji Mapping**
    - Generate issues with all severity levels (critical, medium, low) and verify correct emoji (🚫, ⚠️, ℹ️)
    - Tag: `// Feature: ascii-visualizer, Property 6: Severity Emoji Mapping`
    - **Validates: Requirements 2.3.1, 2.3.2, 2.3.3**
  
  - [x] 4.4 Write property test for status indicators
    - **Property 7: Status Indicators**
    - Generate random issues and verify BEFORE section contains ❌ and AFTER section contains ✅
    - Tag: `// Feature: ascii-visualizer, Property 7: Status Indicators`
    - **Validates: Requirements 2.3.4**
  
  - [x] 4.5 Write property test for line numbers in header
    - **Property 9: Line Numbers in Header**
    - Generate issues with random line numbers (1-10000) and verify header contains "L{number}" format
    - Tag: `// Feature: ascii-visualizer, Property 9: Line Numbers in Header`
    - **Validates: Requirements 2.4.4**

- [x] 5. Implement core visualizer and generator registry
  - [x] 5.1 Create GeneratorRegistry class in `core/visualizer.ts`
    - Implement generator registration and lookup with Map<IssueType, IGenerator>
    - Write `register()`, `get()`, `has()`, `getAll()` methods
    - _Requirements: 4.3.2_
  
  - [x] 5.2 Create AsciiVisualizer class in `core/visualizer.ts`
    - Implement `generate()` method with error handling and timeout protection (50ms timeout)
    - Implement `registerGenerator()` for custom generators
    - Implement `getSupportedTypes()` for introspection
    - Add performance monitoring (track generation time with performance.now())
    - Implement `generateFallback()` for unsupported types (simple text message)
    - Implement `generateErrorVisualization()` for errors (formatted error box)
    - Implement `isValidIssue()` for input validation (check required fields)
    - Initialize TemplateEngine and GeneratorRegistry in constructor
    - _Requirements: 3.1, 3.4, 4.1_
  
  - [x] 5.3 Write property test for size constraints
    - **Property 1: Size Constraints**
    - Generate random issues of all types and verify width ≤ 60 chars and height ≤ 20 lines
    - Count actual width (max line length) and height (line count) from output
    - Tag: `// Feature: ascii-visualizer, Property 1: Size Constraints`
    - **Validates: Requirements 2.1.2**
  
  - [x] 5.4 Write property test for input data preservation
    - **Property 8: Input Data Preservation**
    - Generate random issues and verify visualization contains original CSS value and suggested fix text
    - Tag: `// Feature: ascii-visualizer, Property 8: Input Data Preservation`
    - **Validates: Requirements 2.4.1, 2.4.2**
  
  - [x] 5.5 Write property test for output format
    - **Property 10: Output Format**
    - Generate random issues and verify output is plain text with newlines and no ANSI codes (no \x1b sequences)
    - Tag: `// Feature: ascii-visualizer, Property 10: Output Format`
    - **Validates: Requirements 3.5**
  
  - [x] 5.6 Write property test for performance constraint
    - **Property 11: Performance Constraint**
    - Generate random issues and verify generation time < 50ms for each (check Visualization.generationTime)
    - Tag: `// Feature: ascii-visualizer, Property 11: Performance Constraint`
    - **Validates: Requirements 4.1**
  
  - [x] 5.7 Write unit tests for error handling
    - Test invalid issue data handling (missing type, missing severity, null values)
    - Test unsupported issue type fallback (verify fallback message format)
    - Test generation timeout handling (mock slow generator)
    - Test error visualization format (verify error box structure)
    - _Requirements: 4.1_

- [x] 6. Checkpoint - Ensure core infrastructure tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement fixed dimensions generator
  - [x] 7.1 Create FixedDimensionsGenerator in `generators/fixed-dimensions.ts`
    - Extend BaseGenerator
    - Implement `supports()` method for 'fixed-dimensions' type
    - Implement `generate()` method with header, comparison, and footer
    - Implement `renderFixedBox()` to show overflow with ► indicator and ▓ scrollbar
    - Implement `renderResponsiveBox()` to show solution fitting container perfectly
    - Implement `extractPixelValue()` helper for parsing pixel values from CSS strings
    - Use LayoutCalculator for proportional sizing
    - _Requirements: 3.1 (fixed-dimensions), 2.2.2_
  
  - [x] 7.2 Write unit tests for fixed dimensions generator
    - Test with various fixed widths (600px, 1200px, 300px, 2000px)
    - Test overflow visualization with scrollbar indicator (▓) and direction arrow (►)
    - Test responsive solution visualization (content fits container)
    - Test edge cases (0px, very large values > 5000px)
    - _Requirements: 3.1 (fixed-dimensions)_

- [x] 8. Implement viewport overflow generator
  - [x] 8.1 Create ViewportOverflowGenerator in `generators/viewport-overflow.ts`
    - Extend BaseGenerator
    - Implement `generate()` with mobile (375px) and desktop (1920px) viewports
    - Implement viewport-specific rendering in footer section
    - Add viewport labels clearly ("Mobile 375px", "Desktop 1920px")
    - Show overflow differently across viewports (mobile shows overflow, desktop fits)
    - Use ViewportScaler for calculations
    - _Requirements: 3.1 (viewport-overflow), 2.2.1, 2.2.3_
  
  - [x] 8.2 Write property test for viewport visualization
    - **Property 4: Viewport Visualization**
    - Generate viewport-overflow and media-instability issues and verify viewport labels present
    - Check for "Mobile" and "Desktop" or "375px" and "1920px" in output
    - Tag: `// Feature: ascii-visualizer, Property 4: Viewport Visualization`
    - **Validates: Requirements 2.2.1, 2.2.3**
  
  - [x] 8.3 Write unit tests for viewport overflow generator
    - Test mobile viewport rendering (375px width)
    - Test desktop viewport rendering (1920px width)
    - Test viewport label inclusion and formatting
    - Test overflow at different viewport sizes (element fits desktop but overflows mobile)
    - _Requirements: 3.1 (viewport-overflow)_

- [x] 9. Implement overflow-related generators
  - [x] 9.1 Create OverflowHorizontalGenerator in `generators/overflow-horizontal.ts`
    - Extend BaseGenerator
    - Implement horizontal overflow visualization with ► indicator
    - Show scrollbar representation with ▓ character
    - Visualize content extending beyond container with overflow markers
    - _Requirements: 3.1 (overflow-horizontal), 2.2.2_
  
  - [x] 9.2 Create OverflowMaskingGenerator in `generators/overflow-masking.ts`
    - Extend BaseGenerator
    - Implement body overflow masking visualization
    - Show hidden content indicator with … character
    - Demonstrate overflow:hidden vs overflow:auto difference
    - _Requirements: 3.1 (overflow-masking), 2.2.2_
  
  - [x] 9.3 Write property test for overflow indicators
    - **Property 5: Overflow Indicators**
    - Generate overflow issues (viewport-overflow, overflow-horizontal, overflow-masking)
    - Verify visualization contains overflow indicator characters (▓ or ►)
    - Tag: `// Feature: ascii-visualizer, Property 5: Overflow Indicators`
    - **Validates: Requirements 2.2.2**
  
  - [x] 9.4 Write unit tests for overflow generators
    - Test horizontal overflow with various widths (500px, 1000px, 2000px)
    - Test overflow masking scenarios (hidden vs visible vs auto)
    - Test overflow indicator presence and positioning
    - Test scrollbar visualization (▓ character usage)
    - _Requirements: 3.1 (overflow-horizontal, overflow-masking)_

- [x] 10. Implement flex and grid generators
  - [x] 10.1 Create FlexFragilityGenerator in `generators/flex-fragility.ts`
    - Extend BaseGenerator
    - Visualize flex container with fixed-width children causing overflow
    - Show flex-wrap solution with wrapped items on multiple lines
    - Use █ for flex items and show wrapping behavior clearly
    - Demonstrate flex-wrap: nowrap (problem) vs flex-wrap: wrap (solution)
    - _Requirements: 3.1 (flex-fragility)_
  
  - [x] 10.2 Create GridRigidityGenerator in `generators/grid-rigidity.ts`
    - Extend BaseGenerator
    - Visualize grid with fixed columns causing overflow
    - Show responsive grid solution (auto-fit, minmax)
    - Use grid-like ASCII representation with clear column boundaries
    - Demonstrate fixed grid (problem) vs responsive grid (solution)
    - _Requirements: 3.1 (grid-rigidity)_
  
  - [x] 10.3 Write unit tests for flex and grid generators
    - Test flex container visualization with multiple items (2, 3, 5 items)
    - Test flex-wrap solution rendering (items on multiple lines)
    - Test grid layout visualization with fixed columns (2, 3, 4 columns)
    - Test responsive grid solution (auto-fit, minmax representation)
    - _Requirements: 3.1 (flex-fragility, grid-rigidity)_

- [x] 11. Implement spacing and positioning generators
  - [x] 11.1 Create FixedSpacingGenerator in `generators/fixed-spacing.ts`
    - Extend BaseGenerator
    - Visualize fixed padding/margin with ░ character
    - Show responsive spacing solution (clamp, vw, rem)
    - Demonstrate spacing proportions visually (large fixed vs adaptive)
    - _Requirements: 3.1 (fixed-spacing)_
  
  - [x] 11.2 Create AbsoluteRigidityGenerator in `generators/absolute-rigidity.ts`
    - Extend BaseGenerator
    - Visualize absolute positioning issues (fixed top/left values)
    - Show relative/flexible positioning solution
    - Demonstrate positioning context and how absolute positioning breaks responsiveness
    - _Requirements: 3.1 (absolute-rigidity)_
  
  - [x] 11.3 Write unit tests for spacing and positioning generators
    - Test fixed spacing visualization with various values (20px, 50px, 100px)
    - Test responsive spacing solutions (clamp, vw, rem representations)
    - Test absolute positioning visualization (fixed coordinates)
    - Test relative positioning solution (flexible coordinates)
    - _Requirements: 3.1 (fixed-spacing, absolute-rigidity)_

- [x] 12. Implement responsive and media query generators
  - [x] 12.1 Create MediaInstabilityGenerator in `generators/media-instability.ts`
    - Extend BaseGenerator
    - Visualize media query breakpoint issues
    - Show multiple viewport states (mobile 375px, tablet 768px, desktop 1920px)
    - Include viewport labels for each state
    - Demonstrate breakpoint problems (content breaks at certain widths) and solutions
    - _Requirements: 3.1 (media-instability), 2.2.1, 2.2.3_
  
  - [x] 12.2 Create BreakpointExceededGenerator in `generators/breakpoint-exceeded.ts`
    - Extend BaseGenerator
    - Visualize content exceeding breakpoint width
    - Show adjusted breakpoint solution (wider breakpoint or responsive content)
    - Demonstrate content fitting within breakpoint after fix
    - _Requirements: 3.1 (breakpoint-exceeded)_
  
  - [x] 12.3 Write unit tests for responsive generators
    - Test media query visualization with multiple breakpoints (2, 3, 4 breakpoints)
    - Test breakpoint exceeded visualization (content > breakpoint width)
    - Test multiple viewport rendering (mobile, tablet, desktop)
    - Test viewport label formatting and positioning
    - _Requirements: 3.1 (media-instability, breakpoint-exceeded)_

- [x] 13. Implement remaining generators
  - [x] 13.1 Create BoxInconsistencyGenerator in `generators/box-inconsistency.ts`
    - Extend BaseGenerator
    - Visualize box-sizing issues (content-box vs border-box)
    - Show border-box solution with consistent sizing
    - Demonstrate padding/border impact on total width (content-box adds, border-box includes)
    - _Requirements: 3.1 (box-inconsistency)_
  
  - [x] 13.2 Create NowrapFixedGenerator in `generators/nowrap-fixed.ts`
    - Extend BaseGenerator
    - Visualize nowrap with fixed width causing overflow
    - Show text wrapping solution (normal wrap or word-break)
    - Use … to indicate truncated text in problem state
    - _Requirements: 3.1 (nowrap-fixed)_
  
  - [x] 13.3 Write unit tests for remaining generators
    - Test box-sizing visualization (content-box vs border-box with padding)
    - Test nowrap visualization with overflow (text extends beyond container)
    - Test text wrapping solution (text wraps within container)
    - Test all edge cases for these generators (empty text, very long text)
    - _Requirements: 3.1 (box-inconsistency, nowrap-fixed)_

- [x] 14. Register all generators and validate coverage
  - [x] 14.1 Register all 12 generators in AsciiVisualizer constructor
    - Register fixed-dimensions, viewport-overflow, flex-fragility
    - Register grid-rigidity, fixed-spacing, media-instability
    - Register overflow-masking, breakpoint-exceeded, absolute-rigidity
    - Register box-inconsistency, overflow-horizontal, nowrap-fixed
    - Verify all issue types from requirements are covered (all 12 types)
    - Call registerGenerator() for each type with appropriate generator instance
    - _Requirements: 3.1_
  
  - [x] 14.2 Write integration test for all issue types
    - Test that all 12 issue types generate successfully without errors
    - Verify no unsupported types remain (all types return valid visualizations)
    - Test getSupportedTypes() returns all 12 types
    - Test each type produces output with correct structure
    - _Requirements: 3.1_

- [x] 15. Checkpoint - Ensure all generators work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Integrate with hover provider
  - [x] 16.1 Update hover provider to use AsciiVisualizer
    - Import AsciiVisualizer in hover provider module
    - Instantiate visualizer (singleton pattern recommended for performance)
    - Call `visualizer.generate()` when creating hover content for box model issues
    - Format visualization in markdown code block with 'text' language
    - Add collapsible section if visualization height > 15 lines
    - Position visualization below text explanation in hover content
    - Handle errors gracefully (show fallback if generation fails)
    - _Requirements: 5.1_
  
  - [x] 16.2 Write integration tests for hover provider
    - Test hover displays visualization correctly for various issue types
    - Test markdown formatting and code block rendering
    - Test with various issue types (at least 3 different types)
    - Test collapsible section for large visualizations (> 15 lines)
    - Test error handling when visualization generation fails
    - _Requirements: 5.1_

- [x] 17. Integrate with stats panel
  - [x] 17.1 Update stats panel to display visualizations
    - Import AsciiVisualizer in stats panel module
    - Render visualization in each issue card using `<pre>` tag
    - Add copy-to-clipboard button for visualization
    - Add expand/collapse functionality for compact view (collapsed by default)
    - Escape HTML properly for webview rendering (prevent XSS)
    - Style visualization with monospace font (Consolas, Monaco, or Courier New)
    - _Requirements: 5.2_
  
  - [x] 17.2 Write integration tests for stats panel
    - Test visualization rendering in issue cards (verify HTML structure)
    - Test copy-to-clipboard functionality (verify clipboard content)
    - Test expand/collapse behavior (verify state changes)
    - Test HTML escaping (verify no script injection possible)
    - Test monospace font styling (verify CSS applied)
    - _Requirements: 5.2_

- [x] 18. Integrate with diagnostics
  - [x] 18.1 Store visualizations in diagnostic metadata
    - Generate visualization when creating diagnostics
    - Store in diagnostic custom metadata field (diagnostic.visualization)
    - Make accessible via code actions
    - Include in problem panel details view
    - Handle visualization retrieval gracefully (check if field exists)
    - _Requirements: 5.3_
  
  - [x] 18.2 Write integration tests for diagnostics
    - Test visualization stored in metadata correctly (verify field populated)
    - Test retrieval from diagnostics (verify can read back)
    - Test code action access to visualization (verify code action shows viz)
    - Test problem panel display (verify viz appears in details)
    - _Requirements: 5.3_

- [x] 19. Performance optimization and validation
  - [x] 19.1 Implement lazy generator initialization
    - Convert generator registration to factory functions (Map<IssueType, () => IGenerator>)
    - Instantiate generators on first use only (check instances Map first)
    - Store instances in separate Map for reuse (instances: Map<IssueType, IGenerator>)
    - Update generate() method to use lazy instantiation pattern
    - _Requirements: 4.1_
  
  - [x] 19.2 Optimize string building
    - Use array joining instead of string concatenation (lines.join('\n'))
    - Pre-allocate arrays for known sizes (new Array(expectedSize))
    - Minimize string operations in loops (build once, not incrementally)
    - Use template literals efficiently (avoid nested templates)
    - _Requirements: 4.1_
  
  - [x] 19.3 Run performance benchmarks
    - Benchmark each generator with 1000 iterations (measure total and average time)
    - Verify all generations complete under 50ms (check each iteration)
    - Test cache effectiveness (measure hit rate, should be > 80% for repeated issues)
    - Check for memory leaks with repeated generations (monitor heap size)
    - Profile slow generators and optimize (identify bottlenecks)
    - _Requirements: 4.1_

- [x] 20. Add accessibility support
  - [x] 20.1 Implement alt text generation
    - Add `generateAltText()` method to BaseGenerator
    - Generate human-readable description of visualization
    - Include severity, issue type, line number, and suggestion in alt text
    - Format: "{severity} severity {type} issue on line {line}. Current value: {value}. Suggested fix: {suggestion}"
    - _Requirements: 4.2.4_
  
  - [x] 20.2 Add ARIA labels for webview rendering
    - Wrap visualizations in semantic HTML with role="img"
    - Add aria-label attribute with alt text
    - Include figcaption with sr-only class for screen readers
    - Mark ASCII art as aria-hidden="true" (decorative)
    - _Requirements: 4.2.4_

- [x] 21. Final checkpoint - Complete system validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with 100+ iterations each using fast-check
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation follows a bottom-up approach: utilities → base infrastructure → specific generators → integration
- All 12 issue type generators must be implemented for complete feature coverage:
  1. fixed-dimensions
  2. viewport-overflow
  3. flex-fragility
  4. grid-rigidity
  5. fixed-spacing
  6. media-instability
  7. overflow-masking
  8. breakpoint-exceeded
  9. absolute-rigidity
  10. box-inconsistency
  11. overflow-horizontal
  12. nowrap-fixed
- Performance is critical: all generations must complete in under 50ms
- Each property-based test must be tagged with: `// Feature: ascii-visualizer, Property {number}: {property_text}`
- The 11 correctness properties from the design document are distributed across tasks 1.1, 4.2-4.5, 5.3-5.6, 8.2, and 9.3
- All generators should use the shared character palette (CHARS and EMOJI) for consistency
- Template caching is essential for meeting the 50ms performance requirement
- Lazy initialization reduces startup time and memory usage
