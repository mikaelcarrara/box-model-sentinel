const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function ensureDist(folder) {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
}

function cleanOldVsix(folder) {
  if (!fs.existsSync(folder)) return;
  for (const f of fs.readdirSync(folder)) {
    if (f.toLowerCase().endsWith('.vsix')) {
      try { fs.unlinkSync(path.join(folder, f)); } catch {}
    }
  }
}

function resolveVsceBin(cwd) {
  const bin = process.platform === 'win32' ? 'vsce.cmd' : 'vsce';
  const local = path.join(cwd, 'node_modules', '.bin', bin);
  if (fs.existsSync(local)) return local;
  return bin;
}

function main() {
  const cwd = path.resolve(__dirname, '..');
  const pkgPath = path.join(cwd, 'package.json');
  const pkg = readJson(pkgPath);
  const name = String(pkg.name || 'extension').replace(/[^a-z0-9._-]+/gi, '-');
  const version = String(pkg.version || '0.0.0');
  const mainField = String(pkg.main || '');
  const mainFile = path.join(cwd, mainField);
  if (!fs.existsSync(mainFile)) {
    console.error('main não encontrado:', mainField);
    process.exit(1);
  }
  const acts = Array.isArray(pkg.activationEvents) ? pkg.activationEvents : [];
  const hasLang = acts.includes('onLanguage:css') || acts.includes('onLanguage:scss') || acts.includes('onLanguage:less');
  if (!hasLang) {
    console.error('activationEvents não configurados para onLanguage:*');
    process.exit(1);
  }
  const dist = path.join(cwd, 'dist');
  ensureDist(dist);
  cleanOldVsix(dist);
  const outFile = path.join(dist, `${name}-${version}.vsix`);
  const vsce = resolveVsceBin(cwd);
  const res = spawnSync(vsce, ['package', '--out', outFile], { cwd, stdio: 'inherit', shell: false });
  if (res.status !== 0) {
    console.error('vsce package falhou');
    process.exit(res.status || 1);
  }
  console.log('VSIX gerado em:', outFile);
}

main();
