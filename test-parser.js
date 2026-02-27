const fs = require('fs');
const { parseRules } = require('./src/engine/parser.js');

const css = fs.readFileSync('./TEST-EXAMPLE.css', 'utf8');
const parsed = parseRules(css);

console.log('✓ Parse successful');
console.log('Number of rules:', parsed.rules ? parsed.rules.length : 'undefined');

if (parsed.rules && parsed.rules.length > 0) {
  console.log('\nFirst 3 rules:');
  parsed.rules.slice(0, 3).forEach((rule, i) => {
    console.log(`\n[${i}] ${rule.selector}`);
    console.log('   Properties:', Object.keys(rule.declarations).slice(0, 3).join(', '));
  });
}
