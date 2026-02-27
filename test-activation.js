#!/usr/bin/env node
/**
 * Test: Verificar se a extensão consegue ser carregada
 */

console.log('\n' + '='.repeat(60));
console.log('🔍 Box Model Sentinel - Activation Diagnostic');
console.log('='.repeat(60) + '\n');

const fs = require('fs');
const path = require('path');

// 1. Check package.json
console.log('📋 Verificando package.json...');
const pkgJson = require('./package.json');
console.log(`   ✓ name: "${pkgJson.name}"`);
console.log(`   ✓ main: "${pkgJson.main}"`);
console.log(`   ✓ activation events: ${JSON.stringify(pkgJson.activationEvents)}`);

// 2. Check if main file exists
console.log('\n📁 Verificando arquivo main...');
const mainPath = path.join(__dirname, pkgJson.main);
if (fs.existsSync(mainPath)) {
  console.log(`   ✓ Extension file exists: ${mainPath}`);
} else {
  console.log(`   ❌ Extension file NOT found: ${mainPath}`);
}

// 3. Check dependencies
console.log('\n📦 Verificando dependências...');
try {
  require.resolve('vscode');
  console.log('   ❌ WARNING: "vscode" é fornecido somente em runtime pelo host');
  console.log('      (Não é esperado como dependência local de desenvolvimento)');
} catch(e) {
  console.log('   ✓ "vscode" não está instalado (esperado - fornecido pelo host)');
}

// 4. Check syntax
console.log('\n✅ Verificando sintaxe (node -c)...');
const { execSync } = require('child_process');
try {
  execSync(`node -c "${mainPath}"`, { stdio: 'ignore' });
  console.log('   ✓ Sintaxe do arquivo principal está OK');
} catch (err) {
  console.log('   ❌ Erro de sintaxe no arquivo principal!');
  console.log(err.message);
}

// 5. Check parser
console.log('\n🔧 Verificando parser.js...');
try {
  const { parseRules } = require('./src/engine/parser.js');
  const testCss = '.test { width: 100px; }';
  const result = parseRules(testCss);
  console.log(`   ✓ Parser funciona (${result.rules.length} regra parseada)`);
} catch (err) {
  console.log(`   ❌ Erro no parser: ${err.message}`);
}

// 6. Check lint-engine
console.log('\n🔧 Verificando lint-engine.js...');
try {
  const { LintEngine } = require('./src/engine/lint-engine.js');
  console.log('   ✓ LintEngine pode ser importado (mas requer vscode global)');
} catch (err) {
  if (err.message.includes('vscode')) {
    console.log('   ⚠️  LintEngine precisa do módulo "vscode" (presente apenas no host)');
  } else {
    console.log(`   ❌ Erro ao importar LintEngine: ${err.message}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('📝 PRÓXIMO PASSO:');
console.log('');
console.log('1. Feche o editor completamente');
console.log('2. Execute: code --extensionDevelopmentPath=. TEST-EXAMPLE.css');
console.log('3. Abra: Ctrl+Shift+P > Output > Box Model Sentinel');
console.log('4. Você deve ver logs [BMS] aparecerem');
console.log('');
console.log('='.repeat(60) + '\n');
