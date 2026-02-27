# ASCII to HTML Renderer

Converts ASCII art visualizations to styled HTML with proper theming, hover effects, and accessibility support.

## Features

- 🎨 **Dual Theme Support**: Dark and light themes with proper color schemes
- 🖱️ **Interactive**: Hover effects and tooltips for special characters
- 📋 **Copy Support**: Built-in button to copy raw ASCII text
- ♿ **Accessible**: ARIA labels and semantic HTML
- ⚡ **Performant**: Sub-10ms rendering for typical visualizations
- 🎯 **Zero Dependencies**: Pure JavaScript implementation

## Installation

```javascript
const { AsciiToHtmlRenderer } = require('./ascii-to-html-renderer');
```

## Basic Usage

```javascript
// Create renderer with default options
const renderer = new AsciiToHtmlRenderer();

// Render ASCII to HTML
const ascii = `┌──────────┐
│ Content  │
└──────────┘`;

const html = renderer.render(ascii);
const styles = renderer.getStyles();

// Use in HTML
document.body.innerHTML = `
  <style>${styles}</style>
  ${html}
`;
```

## Configuration Options

```javascript
const renderer = new AsciiToHtmlRenderer({
  fontSize: 12,                    // Font size in pixels (default: 12)
  fontFamily: 'Courier New',       // Monospace font (default: Courier New)
  theme: 'dark',                   // 'dark' or 'light' (default: 'dark')
  enableHover: true,               // Enable hover effects (default: true)
  enableTooltips: true,            // Show tooltips on hover (default: true)
  enableCopyButton: true,          // Show copy button (default: true)
});
```

## Integration Examples

### VS Code Hover Provider

```javascript
const { AsciiToHtmlRenderer } = require('./ascii-to-html-renderer');

class HoverProvider {
  constructor() {
    this.renderer = new AsciiToHtmlRenderer({
      theme: 'dark',
      enableCopyButton: false, // No copy button in hover
    });
  }

  provideHover(document, position) {
    const ascii = generateVisualization(issue);
    
    const markdown = new vscode.MarkdownString();
    markdown.supportHtml = true;
    markdown.isTrusted = true;
    
    // Add styles and HTML
    markdown.appendMarkdown(`
      <style>${this.renderer.getStyles()}</style>
      ${this.renderer.render(ascii)}
    `);
    
    return new vscode.Hover(markdown);
  }
}
```

### VS Code Webview Panel

```javascript
const { AsciiToHtmlRenderer } = require('./ascii-to-html-renderer');

function createStatsPanel(context) {
  const panel = vscode.window.createWebviewPanel(
    'asciiStats',
    'ASCII Visualization',
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  const renderer = new AsciiToHtmlRenderer({
    theme: 'dark',
    enableCopyButton: true,
  });

  const ascii = generateVisualization(issue);

  panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" 
            content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
      <style>${renderer.getStyles()}</style>
    </head>
    <body>
      ${renderer.render(ascii)}
    </body>
    </html>
  `;
}
```

### Dynamic Theme Switching

```javascript
const renderer = new AsciiToHtmlRenderer({ theme: 'dark' });

// Listen to VS Code theme changes
vscode.window.onDidChangeActiveColorTheme((theme) => {
  const newTheme = theme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'light';
  renderer.setTheme(newTheme);
  
  // Re-render with new theme
  updateVisualization();
});
```

## Character Styling

The renderer applies specific styles to different character types:

| Character | Class | Color (Dark) | Color (Light) | Tooltip |
|-----------|-------|--------------|---------------|---------|
| `█` | `ascii-solid` | Blue (#569cd6) | Blue (#0066cc) | Content area |
| `▓` | `ascii-scrollbar` | Yellow (#dcdcaa) | Gold (#b8860b) | Scrollbar (~15px) |
| `░` | `ascii-padding` | Teal (#4ec9b0) | Teal (#008080) | Padding/spacing |
| `─│┌┐└┘` | `ascii-border` | Gray (#858585) | Gray (#666666) | - |
| `►◄▼` | `ascii-arrow` | Red (#f48771) | Red (#cc0000) | Overflow direction |
| `❌` | `ascii-error` | Red (#f48771) | Red (#cc0000) | Problem detected |
| `✅` | `ascii-success` | Green (#4ec9b0) | Green (#008000) | Recommended solution |
| `⚠️` | `ascii-warning` | Yellow (#dcdcaa) | Gold (#b8860b) | Warning |

## API Reference

### Constructor

```javascript
new AsciiToHtmlRenderer(options?: AsciiToHtmlOptions)
```

Creates a new renderer instance with optional configuration.

### Methods

#### `render(asciiText: string): string`

Converts ASCII text to styled HTML.

**Parameters:**
- `asciiText` - The ASCII art string to render

**Returns:** HTML string with styled visualization

**Example:**
```javascript
const html = renderer.render('┌──┐\n│██│\n└──┘');
```

#### `getStyles(): string`

Generates CSS styles for the visualization. Styles are cached after first call.

**Returns:** CSS string

**Example:**
```javascript
const css = renderer.getStyles();
```

#### `setTheme(theme: 'dark' | 'light'): void`

Changes the theme and clears the style cache.

**Parameters:**
- `theme` - The theme to apply

**Example:**
```javascript
renderer.setTheme('light');
```

#### `clearCache(): void`

Clears the cached styles. Useful when changing options.

**Example:**
```javascript
renderer.clearCache();
```

## Performance

The renderer is optimized for speed:

- ✅ Typical visualizations render in **< 5ms**
- ✅ Styles are cached and reused
- ✅ No external dependencies
- ✅ Minimal DOM operations

Performance test results:
```
10-line visualization: ~2ms
20-line visualization: ~4ms
50-line visualization: ~8ms
```

## Accessibility

The renderer includes comprehensive accessibility support:

- **ARIA Labels**: All visualizations have `role="img"` and descriptive labels
- **Tooltips**: Character-specific tooltips with `aria-label` attributes
- **Keyboard Navigation**: Copy button is keyboard accessible
- **High Contrast**: Supports high contrast mode with enhanced styling
- **Screen Readers**: Semantic HTML structure for better screen reader support

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ VS Code Webview (Electron)

## Testing

Run the test suite:

```bash
npm test -- ascii-to-html-renderer
```

Test coverage:
- ✅ Basic rendering
- ✅ Special character handling
- ✅ Theme switching
- ✅ Tooltips
- ✅ HTML escaping
- ✅ Performance benchmarks
- ✅ Accessibility features
- ✅ Edge cases

## Examples

### Simple Box

```javascript
const ascii = `┌──────┐
│ Test │
└──────┘`;

const html = renderer.render(ascii);
```

### Viewport Overflow Visualization

```javascript
const ascii = `Viewport width overflow • ⚠️ Medium • L42
┌────────────────────────────────────────────┐
│  ANTES                  DEPOIS             │
│  width: 100vw          width: 100%         │
│  ┌──────────┐▓        ┌──────────┐        │
│  │ content  │▓        │ content  │        │
│  │ ████████ │▓        │ ████████ │        │
│  └──────────┘▓        └──────────┘        │
│  ▓ = scrollbar         sem overflow       │
│                                            │
│  ❌ scroll horizontal   ✅ ajuste perfeito │
└────────────────────────────────────────────┘`;

const html = renderer.render(ascii);
```

## Troubleshooting

### Styles not applying

Make sure to include the styles in your HTML:

```javascript
const styles = renderer.getStyles();
// Include styles before the HTML
```

### Copy button not working

Ensure scripts are enabled in your webview:

```javascript
const panel = vscode.window.createWebviewPanel(
  'id',
  'Title',
  vscode.ViewColumn.One,
  { enableScripts: true } // Required for copy button
);
```

### Theme not updating

Call `setTheme()` to update and clear the cache:

```javascript
renderer.setTheme('light');
const newStyles = renderer.getStyles(); // Gets fresh styles
```

## License

MIT

## Contributing

Contributions are welcome! Please ensure:
- All tests pass
- Performance benchmarks are met
- Accessibility standards are maintained
- Code follows existing style
