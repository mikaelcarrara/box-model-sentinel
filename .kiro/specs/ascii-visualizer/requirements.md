# ASCII Layout Visualizer - Requirements

## 1. Overview

Create an ASCII art visualization system that generates compact "BEFORE vs AFTER" miniatures for CSS box model issues detected by Box Model Sentinel. These visualizations will help developers quickly understand layout problems and their solutions through visual comparison.

## 2. User Stories

### 2.1 As a developer, I want to see visual representations of layout problems
**Acceptance Criteria:**
- Each diagnostic includes an ASCII visualization showing the problem
- Visualizations are compact (max 60 chars width, 20 lines height)
- Clear "BEFORE" and "AFTER" comparison side-by-side
- Visual uses consistent characters and symbols

### 2.2 As a developer, I want to understand viewport impact
**Acceptance Criteria:**
- Responsive issues show multiple viewport sizes (mobile 375px, desktop 1920px)
- Overflow is clearly indicated with visual markers
- Viewport labels are included when relevant
- Mobile-first problems are prioritized in visualization

### 2.3 As a developer, I want quick visual feedback on severity
**Acceptance Criteria:**
- Critical issues use 🚫 emoji
- Medium issues use ⚠️ emoji
- Low/Info issues use ℹ️ emoji
- Status indicators (❌/✅) show problem vs solution

### 2.4 As a developer, I want to see real CSS values in visualizations
**Acceptance Criteria:**
- Original CSS values are displayed (e.g., "600px", "100vw")
- Suggested fixes are shown (e.g., "max-width: 100%", "clamp()")
- Proportions are visually approximate to real values
- Line numbers are included in header

## 3. Functional Requirements

### 3.1 Visualization Generator
**Must support 12 issue types:**
1. Fixed Dimensions (fixed-dimensions)
2. Viewport Width Overflow (viewport-overflow)
3. Flex Fragility (flex-fragility)
4. Grid Rigidity (grid-rigidity)
5. Fixed Spacing (fixed-spacing)
6. Media Query Instability (media-instability)
7. Body Overflow Masking (overflow-masking)
8. Breakpoint Width Exceeded (breakpoint-exceeded)
9. Absolute Positioning Rigidity (absolute-rigidity)
10. Box Model Inconsistency (box-inconsistency)
11. Horizontal Overflow Risk (overflow-horizontal)
12. No-wrap Fixed Width (nowrap-fixed)

### 3.2 Visual Palette
**Character Set:**
- `█` = solid content
- `▓` = scrollbar / overflow
- `░` = padding / spacing
- `─` `│` `┌` `┐` `└` `┘` = container borders
- `▼` `►` `◄` = direction indicators
- `…` = truncated content

**Emoji Set:**
- `🚫` = Critical severity
- `⚠️` = Medium severity
- `ℹ️` = Low/Info severity
- `❌` = problem indicator
- `✅` = solution indicator
- `→` = transition/comparison

### 3.3 Template Structure
```
┌──────────────────────────────────────────────────────┐
│ [TYPE] • [SEVERITY] • L[LINE]                        │
├──────────────────────────────────────────────────────┤
│  ANTES                    →           DEPOIS         │
│  [miniature layout]                  [miniature fix] │
│  [status/measures]                   [status/measures]│
│                                                      │
│  [critical viewports if applicable]                  │
└──────────────────────────────────────────────────────┘
```

### 3.4 Input Interface
```typescript
interface Issue {
  type: string;           // "fixed-dimensions", "viewport-overflow", etc.
  severity: string;       // "critical", "medium", "low"
  line: number;
  selector: string;       // ".card", "#hero", etc.
  property: string;       // "width", "padding", etc.
  value: string;          // "600px", "100vw", etc.
  suggestion: string;     // Text suggestion for fix
  category: string;       // "flex", "grid", "overflow", "other"
}
```

### 3.5 Output Format
- Plain text ASCII art string
- UTF-8 encoded
- Newline-separated lines
- No ANSI color codes (use emojis for color)
- Copyable to clipboard

## 4. Non-Functional Requirements

### 4.1 Performance
- Generation time < 50ms per visualization
- No blocking of main thread
- Cached templates for common patterns

### 4.2 Usability
- Visualizations readable in monospace fonts
- Clear at 12pt font size
- Works in light and dark themes
- Accessible (screen reader friendly with alt text)

### 4.3 Maintainability
- Template-based system for easy updates
- Separate generator per issue type
- Unit testable components
- Clear documentation for adding new types

## 5. Integration Points

### 5.1 Hover Provider
- ASCII visualization appears in hover tooltip
- Positioned below text explanation
- Markdown code block formatting
- Collapsible section if too large

### 5.2 Stats Panel
- Each issue card shows miniature visualization
- Expandable to full size on click
- Copy button for sharing
- Export to image option (future)

### 5.3 Diagnostics
- Visualization stored in diagnostic metadata
- Accessible via code actions
- Included in problem panel details

## 6. Future Enhancements

### 6.1 Interactive Mode
- Click to toggle between viewports
- Animate transition from BEFORE to AFTER
- Highlight affected elements

### 6.2 Customization
- User-defined viewport sizes
- Custom character sets
- Compact vs detailed modes
- Color scheme preferences

### 6.3 Export Options
- Export as SVG
- Export as PNG
- Copy as Markdown
- Share as gist

## 7. Success Metrics

### 7.1 Developer Understanding
- 90% of developers understand problem in < 5 seconds
- Reduced time to fix issues by 30%
- Fewer questions about diagnostic meaning

### 7.2 Adoption
- 80% of users enable visualizations
- Positive feedback in surveys
- Feature requests for more visualization types

### 7.3 Technical
- Zero performance impact on analysis
- < 1% error rate in visualization generation
- 100% coverage of all 12 issue types

## 8. Constraints

### 8.1 Technical Constraints
- Must work in VS Code webview (limited HTML/CSS)
- No external dependencies for rendering
- Pure JavaScript/TypeScript implementation
- No canvas or graphics libraries

### 8.2 Design Constraints
- Maximum 60 characters width
- Maximum 20 lines height
- Monospace font required
- UTF-8 character set only

### 8.3 Compatibility Constraints
- VS Code 1.75.0+
- Windows, macOS, Linux
- All supported VS Code themes
- Screen readers compatible

## 9. Open Questions

1. Should visualizations be generated on-demand or pre-generated?
2. Should we cache visualizations or regenerate each time?
3. How to handle very complex layouts (nested flex/grid)?
4. Should we support custom templates per user?
5. How to make visualizations accessible for screen readers?

## 10. Dependencies

- Box Model Sentinel core engine (issue detection)
- VS Code Hover API
- Markdown rendering in webview
- Diagnostic metadata storage

## 11. Risks

### 11.1 Technical Risks
- ASCII art may not render correctly in all fonts
- Complex layouts may be hard to visualize in 60 chars
- Performance impact if generating many visualizations

### 11.2 UX Risks
- Visualizations may be confusing for some users
- Too much visual noise in hover tooltips
- Accessibility concerns for screen reader users

### 11.3 Mitigation Strategies
- Provide toggle to disable visualizations
- Offer compact mode for simpler layouts
- Include text descriptions for accessibility
- Performance profiling and optimization

---

**Status:** Draft  
**Version:** 1.0  
**Last Updated:** 2024-01-15  
**Owner:** Box Model Sentinel Team
