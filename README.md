# 📐 Box Model Sentinel

> Real-time CSS layout integrity analysis for responsive design

[![Version](https://img.shields.io/badge/version-1.1.8-blue)](https://github.com/mikaelcarrara/box-model-sentinel)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

**Box Model Sentinel** is a VS Code extension that monitors CSS files in real-time, detecting box model integrity issues and responsiveness problems that break layouts on smaller devices.

---

## 🎯 Why Box Model Sentinel?

Websites break not because CSS is ugly, but because **fixed pixels don't scale**. Box Model Sentinel detects structural layout problems while you type:

- ❌ **Fixed dimensions** (`width: 400px; height: 600px;`)
- ❌ **100vw without scrollbar compensation** (`width: 100vw` → overflow!)
- ❌ **Rigid flex containers** (`flex-wrap: nowrap` + `flex-basis: 200px`)
- ❌ **Grid with fixed tracks** (`grid-template-columns: 250px 250px 250px`)
- ❌ **Rigid absolute positioning** (`left: 100px; width: 500px`)
- ❌ **Fixed spacing** (`padding: 20px` without breakpoints)
- ❌ **Media query conflicts** (width changes between breakpoints)
- ❌ **Overflow masking** (`body { overflow-x: hidden; }`)

And more. **In real-time**, as you type.

---

## 🚀 Installation

### Via Visual Studio Code Marketplace

1. Open Visual Studio Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Box Model Sentinel"
4. Click Install

### Development Mode

```bash
git clone https://github.com/mikaelcarrara/box-model-sentinel.git
cd box-model-sentinel
npm install
code --extensionDevelopmentPath=. TEST-EXAMPLE.css
```

---

## 📖 Features

### 🔍 Real-time Analysis

- **Automatic detection** on CSS/SCSS/LESS/SASS files
- **Debounced analysis** (500ms default) for performance
- **12 specialized detectors** for layout issues
- **Smart caching** to avoid redundant analysis

### 📊 Stats Panel

Open the Stats panel to see all issues in the current file:

**Command:** `Box Model Sentinel: Show Stats` (F1 or Ctrl+Shift+P)

Features:
- **Visual severity indicators** (Critical/Medium/Low)
- **Click-to-navigate** to issue location
- **Filter by severity** (click on severity cards)
- **Auto-refresh** when analysis completes
- **Persistent state** between tab switches

### 💡 Rich Hover Information

Hover over any underlined issue to see:
- **Severity icon** (🚫 Critical / ⚠️ Medium / ℹ️ Info)
- **Detailed explanation** of the problem
- **Viewport impact** description
- **Actionable suggestion** for fixing

### 🎨 Visual Feedback

| Color | Severity | Meaning |
|-------|----------|---------|
| 🔴 **Red** | Critical | Guaranteed overflow on small viewports |
| 🟡 **Yellow** | Medium | High risk of responsive issues |
| 🔵 **Blue** | Info | Non-ideal pattern, less critical |

---

## 🔍 Detectors (12 Total)

### 1. Fixed Dimensions
Detects `width`, `height`, `min-width`, `min-height` with fixed pixel values.

```css
.box { width: 400px; }  /* ⚠️ Medium */
.card { width: 500px; height: 300px; }  /* 🚫 Critical - both fixed */
```

**Severity:** Medium (single) / Critical (both width + height)

### 2. Box Model Inconsistency
Detects mixed `border-box` and `content-box` in the same project.

```css
* { box-sizing: border-box; }
.legacy { box-sizing: content-box; }  /* ⚠️ Medium */
```

**Severity:** Medium

### 3. Horizontal Overflow Risk
Detects fixed width with `overflow-x: visible` or cumulative padding/margins.

```css
.container { 
  width: 1200px; 
  overflow-x: visible;  /* ⚠️ Medium */
}
```

**Severity:** Medium

### 4. Fixed Spacing
Detects `margin`, `padding`, `gap` with fixed values without breakpoints.

```css
.box { 
  padding: 20px; 
  margin: 15px;  /* ℹ️ Info */
}
```

**Severity:** Low (Info)

### 5. Viewport Width Overflow (100vw)
Detects `width: 100vw` which includes scrollbar width.

```css
.hero { width: 100vw; }  /* ⚠️ Medium - use 100% instead */
```

**Severity:** Medium

### 6. Flex Fragility
Detects flex containers without `flex-wrap` or with rigid basis.

```css
.flex { 
  display: flex; 
  flex-wrap: nowrap; 
  flex-basis: 200px;  /* 🚫 Critical */
}
```

**Severity:** Critical (nowrap + fixed basis) / Medium (missing wrap)

### 7. Grid Rigidity
Detects grid tracks with fixed pixel sizes.

```css
.grid { 
  grid-template-columns: 250px 250px 250px;  /* ⚠️ Medium */
}
```

**Severity:** Medium

### 8. Absolute Positioning Rigidity
Detects `position: absolute` with fixed offsets or dimensions.

```css
.modal { 
  position: absolute; 
  top: 50px; 
  left: 100px; 
  width: 500px;  /* ⚠️ Medium */
}
```

**Severity:** Medium

### 9. Media Query Instability
Detects properties that vary between base and breakpoints.

```css
.card { width: 400px; }
@media (max-width: 768px) { 
  .card { width: 350px; }  /* ⚠️ Medium */
}
```

**Severity:** Medium

### 10. Body Overflow Masking
Detects `overflow-x: hidden` on `body` (masks structural problems).

```css
body { overflow-x: hidden; }  /* ⚠️ Medium */
```

**Severity:** Medium

### 11. !important on Layout Properties
Detects `!important` on layout properties.

```css
.alert { width: 100% !important; }  /* ℹ️ Info */
```

**Severity:** Low (Info)

### 12. Breakpoint Width Exceeded
Detects width larger than breakpoint inside `@media` query.

```css
@media (max-width: 768px) {
  .container { width: 800px; }  /* 🚫 Critical - guaranteed overflow */
}
```

**Severity:** Critical

---

## ⚙️ Configuration

Add to your `settings.json`:

```json
{
  "boxModelSentinel.enable": true,
  "boxModelSentinel.mode": "strict",
  "boxModelSentinel.debounceMs": 500,
  "boxModelSentinel.maxProblems": 100,
  "boxModelSentinel.fixedWidthThreshold": 320,
  "boxModelSentinel.fixedHeightThreshold": 320,
  "boxModelSentinel.fixedSpacingThreshold": 24,
  "boxModelSentinel.ignoreSelectors": []
}
```

### Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `enable` | `true` | Enable/disable analysis |
| `mode` | `"strict"` | Analysis mode: `strict` or `pragmatic` |
| `debounceMs` | `500` | Delay before analyzing after change (ms) |
| `maxProblems` | `100` | Maximum problems reported per file |
| `fixedWidthThreshold` | `320` | Threshold (px) for fixed width in pragmatic mode |
| `fixedHeightThreshold` | `320` | Threshold (px) for fixed height in pragmatic mode |
| `fixedSpacingThreshold` | `24` | Threshold (px) for spacing in pragmatic mode |
| `ignoreSelectors` | `[]` | Selectors to ignore (case-insensitive substring match) |

### Analysis Modes

#### How to Switch Modes

**Option 1: VS Code Settings UI**
1. Open Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "Box Model Sentinel"
3. Find "Mode" dropdown
4. Select `strict` or `pragmatic`

**Option 2: settings.json**
```json
{
  "boxModelSentinel.mode": "pragmatic"  // or "strict"
}
```

**Option 3: Workspace Settings**
Create `.vscode/settings.json` in your project:
```json
{
  "boxModelSentinel.mode": "pragmatic"
}
```

Changes take effect immediately on the next file save or edit.

---

#### Strict Mode (Default)
Reports all rigid pixel usage without filters. 100% structural detection.

**Best for:**
- New projects starting from scratch
- Learning responsive design principles
- Strict adherence to fluid layouts
- Design systems with zero fixed dimensions

#### Pragmatic Mode
Applies thresholds to reduce noise in real projects. Suppresses small, safe values.

**Best for:**
- Legacy codebases with many fixed values
- Projects with established design systems
- Reducing alert fatigue in large teams
- Focusing on critical issues only

**Comparison:**

| Type | Strict | Pragmatic |
|------|--------|-----------|
| `width`/`height` (px) | Always reports | Reports if > thresholds |
| Spacing (`padding`/`margin`/`gap`) | Always | Suppresses if ≤ `fixedSpacingThreshold` |
| Grid tracks (px) | Always | Reports only tracks > `fixedWidthThreshold` |
| Flex basis (px) | Always | Reports only if > `fixedWidthThreshold` |
| Overflow masking / !important / breakpoints | Always | Always |

**Example:**

```css
/* This CSS file */
.button { padding: 8px; }           /* ℹ️ Strict: reported | Pragmatic: suppressed (≤24px) */
.card { width: 200px; }             /* ⚠️ Strict: reported | Pragmatic: suppressed (≤320px) */
.hero { width: 1200px; }            /* ⚠️ Both modes: reported (>320px) */
body { overflow-x: hidden; }        /* ⚠️ Both modes: always reported */
```

---

## 🧩 Architecture

### Project Structure

```
box-model-sentinel/
├── src/
│   ├── engine/
│   │   ├── lint-engine.js        # Analysis engine (listeners + diagnostics)
│   │   ├── parser.js             # CSS parser with @media support
│   │   ├── issue-classifier.js   # Type classification (flex/grid/overflow/other)
│   │   ├── stats-model.js        # buildStatsModel(issues) for counts/items
│   │   └── formatter.js          # Markdown formatter for hover messages
│   ├── extension/
│   │   ├── extension.js          # Entry point (webview panel)
│   │   └── hover-provider.js     # Hover provider
│   └── ui/
│       ├── stats-panel.js        # HTML generator for panel (CSP + nonce)
│       └── assets/
│           ├── stats.css         # Panel styles (VS Code tokens)
│           └── stats.js          # List renderer (read-only)
├── extension.js                  # Root delegator
├── package.json                  # Extension configuration
├── README.md                     # This file
└── TEST-EXAMPLE.css              # Test file
```

### Key Components

#### LintEngine (`src/engine/lint-engine.js`)
- **Debounced analysis** with configurable delay
- **12 specialized detectors** for different issue types
- **Diagnostic collection** integration with VS Code
- **Issue caching** by URI for performance
- **Analysis listeners** for reactive updates

#### Parser (`src/engine/parser.js`)
- **CSS comment stripping**
- **Declaration parsing** (property: value pairs)
- **@media query support** with nested rule extraction
- **Brace-matching algorithm** for complex nesting

#### Stats Panel (`src/ui/stats-panel.js` + `assets/`)
- **CSP-compliant** HTML generation with nonce
- **Reactive filtering** by severity
- **Click-to-navigate** to issue location
- **Auto-refresh** on analysis completion
- **Persistent state** between tab switches

#### Hover Provider (`src/extension/hover-provider.js`)
- **Rich markdown** hover messages
- **Severity icons** (🚫/⚠️/ℹ️)
- **Structured information** (Explanation / Impact / Suggestion)
- **Unit highlighting** in text (px, rem, vw)

---

## 🧪 Testing

### Quick Test

```bash
# 1. Navigate to directory
cd box-model-sentinel

# 2. Install dependencies
npm install

# 3. Open in dev mode
code --extensionDevelopmentPath=. TEST-EXAMPLE.css

# 4. Wait ~500ms for analysis
# → Squiggles appear automatically

# 5. Open stats panel
# F1 → Box Model Sentinel: Show Stats
```

### Available Scripts

```bash
# Activation diagnostics
npm run diagnose

# Open in development mode
npm run dev

# Create release package
npm run release
```

---

## 🎓 Philosophy

Box Model Sentinel doesn't "ban" pixels. It identifies **when** and **where** rigid pixel usage degrades responsiveness and reflow capability. The goal isn't stylistic—it's to preserve layout integrity across different viewports with practical, safe suggestions.

### Design Principles

1. **Structural, not stylistic** - Focus on layout integrity, not code style
2. **Real-time feedback** - Catch issues while typing, not after deployment
3. **Actionable suggestions** - Every issue includes a fix suggestion
4. **Performance-conscious** - Debouncing, caching, and efficient parsing
5. **Non-intrusive** - Read-only analysis, never modifies your code

---

## 📦 Release Notes

### 1.1.8
- Added official extension icon at resources/icon.png
- Packaging hygiene: exclude .kiro/ and *.vsix from VSIX and repository
- README updated with version badge 1.1.8

### 1.1.7
- Renamed extension to box-model-sentinel
- Publisher set to mikaelmc
- Repository URLs updated to mikaelcarrara/box-model-sentinel

---

## 🤝 Integration with AI Assistants

Box Model Sentinel produces structural diagnostics in real-time. You can optionally use AI extensions (GitHub Copilot, VS Code AI) to complement these signals with contextual fix suggestions.

### What AI Helps With

- Identify layout inconsistencies beyond syntax
- Offer contextual "Quick Fixes" from diagnostic lines
- Explain business rules from code comments
- Propose refactorings based on project patterns

### How to Use

- **Quick Fix icon** (✨/💡): Position cursor on underlined issue, use `Ctrl+.` or `Alt+Enter`
- **Selection + Chat**: Select CSS block, use "Ask Copilot / Explain this selection"
- **Command Palette**: `Ctrl+Shift+P` → "Copilot: Fix this" or "Ask Copilot"

### Example Prompts

- "Explain why this 'Fixed width' diagnostic appeared and propose a safe fix"
- "Can padding in % with fixed width cause overflow? Suggest refactoring using clamp()"
- "Explain the ERROR-201 comment and generate a patch to fix it"

---

## 🔧 Troubleshooting

### Native CSS Validation Conflicts

If you're mixing SCSS in `.css` files, VS Code's native validator may show many syntax errors. To work without noise:

```json
// .vscode/settings.json
{
  "css.validate": false
}
```

Box Model Sentinel diagnostics continue working normally.

### Stats Panel Shows Empty

If the Stats panel opens empty:
1. Wait for analysis to complete (~500ms after opening file)
2. Check if file is a supported type (CSS/SCSS/LESS/SASS)
3. Verify `boxModelSentinel.enable` is `true` in settings
4. Check Output panel (View → Output → Box Model Sentinel) for errors

### Performance Issues

For large files (>5000 lines):
1. Increase `debounceMs` to 1000-2000ms
2. Reduce `maxProblems` to 50
3. Use `ignoreSelectors` to skip utility classes
4. Consider splitting CSS into smaller files

---

## 🐛 Bug Reports

Found a bug?

1. Check if it's a configuration issue (not a CSS problem)
2. Provide the CSS file that causes the issue
3. Describe expected vs observed behavior
4. Include VS Code version and extension version

[Open an issue on GitHub](https://github.com/mikaelcarrara/box-model-sentinel/issues)

---

## 🛣️ Roadmap

### Current Features ✅
- ✅ Real-time analysis with 12 detectors
- ✅ Rich hover messages with markdown
- ✅ Stats panel with severity filtering
- ✅ Click-to-navigate to issue location
- ✅ Configurable analysis modes (strict/pragmatic)
- ✅ Selector ignore patterns
- ✅ Support for CSS/SCSS/LESS/SASS

### Planned Features 🚧
- [ ] Quick fix code actions
- [ ] Custom rule configuration
- [ ] Export reports (JSON/HTML)
- [ ] Performance profiling for large files
- [ ] Unit test coverage
- [ ] CI/CD integration examples

---

## ⚖️ Disclaimer

This project is independent and not affiliated with, endorsed by, or maintained by Microsoft, Visual Studio Code, VS Code, GitHub, or GitHub Copilot.

"Microsoft", "Visual Studio Code", "VS Code", and "GitHub" are trademarks of their respective owners. Mentions of these tools serve exclusively to describe compatibility and optional integration.

---

## 📄 License

This project is distributed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

**Made with ❤️ for better CSS layouts**

