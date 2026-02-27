const fs = require('fs');
const { parseRules } = require('./src/engine/parser.js');

const css = fs.readFileSync('./TEST-EXAMPLE.css', 'utf8');
const parsed = parseRules(css);

console.log('✓ Parsed', parsed.rules.length, 'CSS rules\n');

// Simular o detector de Fixed Dimensions
const issues = [];

for (const rule of parsed.rules) {
  const w = rule.declarations['width'];
  const h = rule.declarations['height'];

  if (w && /\b\d+px\b/i.test(w)) {
    issues.push({
      issue: 'Fixed width',
      severity: 'medium',
      selector: rule.selector
    });
  }

  if (h && /\b\d+px\b/i.test(h)) {
    issues.push({
      issue: 'Fixed height',
      severity: 'medium',
      selector: rule.selector
    });
  }

  if (w && h && /\b\d+px\b/i.test(w) && /\b\d+px\b/i.test(h)) {
    issues.push({
      issue: 'Fixed box dimensions',
      severity: 'critical',
      selector: rule.selector
    });
  }
}

console.log(`✓ Issues detected: ${issues.length}\n`);
issues.slice(0, 5).forEach((issue, i) => {
  console.log(`[${i}] ${issue.selector}: ${issue.issue} (${issue.severity})`);
});
