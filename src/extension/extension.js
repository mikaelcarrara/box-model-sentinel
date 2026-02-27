const vscode = require('vscode');
const { LintEngine } = require('../engine/lint-engine');
const { IssueClassifier } = require('../engine/issue-classifier');
const { getStatsHtml } = require('../ui/stats-panel');
const { HoverProvider } = require('./hover-provider');
const { buildStatsModel } = require('../engine/stats-model');


let lintEngine;
let issuesCache = new Map();
let statusBar;

// JS Agent removido

async function activate(context) {
  const output = vscode.window.createOutputChannel('Box Model Sentinel');
  output.appendLine('[BMS] Activation started');
  try { output.show(true); } catch (e) { try { console.error('[BMS] Failed to show output channel:', e && e.message); } catch (_) {} }

  try {
    lintEngine = new LintEngine();
    const collection = vscode.languages.createDiagnosticCollection('Box Model Sentinel');
    lintEngine.setDiagnosticCollection(collection);
    lintEngine.onAnalysisComplete((uri, issues) => {
      issuesCache.set(uri.toString(), issues);
      output.appendLine(`[BMS] Analysis complete for ${uri.toString()}: ${issues.length} issues`);
      const counts = { critical: 0, medium: 0, low: 0 };
      for (const i of issues) {
        const s = (i.severity || '').toLowerCase();
        if (counts[s] !== undefined) counts[s]++;
      }
      statusBar.text = `BMS: C${counts.critical} M${counts.medium} L${counts.low}`;
    });
  } catch (e) {
    output.appendLine('[BMS] LintEngine init failed: ' + (e && e.message));
    lintEngine = null;
  }

  const hoverDisposable = vscode.languages.registerHoverProvider(['css', 'scss', 'less', 'sass'], new HoverProvider(issuesCache));

  const cmd = vscode.commands.registerCommand('box-model-sentinel.test', () => {
    vscode.window.showInformationMessage('Box Model Sentinel ativado');
    output.appendLine('[BMS] Test command executed');
  });

  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.text = 'BMS: -';
  statusBar.show();

  let currentPanel = null;

  const statsCmd = vscode.commands.registerCommand('box-model-sentinel.showStats', () => {
    // Fecha qualquer painel existente antes de criar um novo
    if (currentPanel) {
      currentPanel.dispose();
      currentPanel = null;
    }
    try { output.show(true); } catch (e) { output.appendLine('[BMS] Failed to show output channel: ' + (e && e.message)); }
    output.appendLine('[BMS] Opening Stats panel');

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const doc = editor.document;
    
    // Armazenar referência do documento para navegação
    let sourceDocument = doc;
    
    const panel = vscode.window.createWebviewPanel('bmsStats', 'Box Model Sentinel • Stats', vscode.ViewColumn.Beside, { enableScripts: true });
    currentPanel = panel;
    const makeModel = () => {
      const currentEditor = vscode.window.activeTextEditor;
      if (!currentEditor) return { issues: [], counts: { critical: 0, medium: 0, low: 0 }, typeCounts: { flex: 0, grid: 0, overflow: 0, other: 0 }, items: [] };
      const u = currentEditor.document.uri.toString();
      let issues = issuesCache.get(u) || [];
      output.appendLine(`[BMS] makeModel: uri=${u}, issuesCache.size=${issuesCache.size}, issues.length=${issues.length}`);
      if ((!issues || issues.length === 0) && lintEngine && typeof lintEngine.getIssuesForUri === 'function') {
        issues = lintEngine.getIssuesForUri(currentEditor.document.uri) || [];
        output.appendLine(`[BMS] makeModel: fallback to lintEngine, issues.length=${issues.length}`);
      }
      // Log das severidades
      const severityCounts = { critical: 0, medium: 0, low: 0 };
      for (const issue of issues) {
        const sev = String(issue.severity || '').toLowerCase();
        output.appendLine(`[BMS] Issue: ${issue.issue}, severity="${issue.severity}", normalized="${sev}"`);
        if (severityCounts[sev] !== undefined) severityCounts[sev]++;
      }
      output.appendLine(`[BMS] Severity counts: ${JSON.stringify(severityCounts)}`);
      const stats = buildStatsModel(issues, IssueClassifier);
      output.appendLine(`[BMS] Stats model: ${JSON.stringify(stats.counts)}`);
      return { issues, ...stats };
    };
    const render = () => {
      const model = makeModel();
      panel.webview.html = getStatsHtml(model, panel.webview, context.extensionUri);
    };
    // Forçar uma análise imediata do editor ativo para popular o painel
    const needsAnalysis = (() => {
      try {
        const ed = vscode.window.activeTextEditor;
        if (!ed || !lintEngine || typeof lintEngine.shouldAnalyze !== 'function') return false;
        const u = ed.document.uri.toString();
        const cached = issuesCache.get(u);
        // Se já tem cache, não precisa analisar
        if (cached && cached.length > 0) return false;
        return lintEngine.shouldAnalyze(ed.document);
      } catch {
        return false;
      }
    })();

    if (needsAnalysis) {
      // Adiciona listener temporário para renderizar quando a análise completar
      const tempListener = (uri, issues) => {
        const active = vscode.window.activeTextEditor;
        if (active && active.document.uri.toString() === uri.toString()) {
          render();
        }
      };
      const removeTemp = lintEngine.addAnalysisListener(tempListener);
      
      // Executa análise
      try {
        const ed = vscode.window.activeTextEditor;
        if (ed) {
          lintEngine.executeAnalysis(ed.document);
        }
      } catch {}
      
      // Remove listener temporário após 2 segundos (fallback)
      setTimeout(() => removeTemp(), 2000);
    }
    
    // Render inicial (pode estar vazio se análise ainda não completou)
    render();
    
    
    panel.onDidChangeViewState((e) => {
      // Só re-renderiza se estava inativo e agora ficou ativo
      // E se realmente há um editor ativo com conteúdo
      if (e.webviewPanel.active) {
        const active = vscode.window.activeTextEditor;
        if (active) {
          const u = active.document.uri.toString();
          const cached = issuesCache.get(u);
          // Só re-renderiza se tem cache ou se pode obter issues
          if (cached && cached.length > 0) {
            render();
          }
        }
      }
    });
    const activeEditorListener = vscode.window.onDidChangeActiveTextEditor((ed) => {
      if (!ed) return;
      // Atualizar documento fonte quando mudar de editor
      sourceDocument = ed.document;
      render();
      
    });

    // Re-render somente quando a análise terminar para o documento ativo
    const removeListener = lintEngine ? lintEngine.addAnalysisListener((u, issues) => {
      const active = vscode.window.activeTextEditor;
      if (active && active.document && active.document.uri.toString() === u && currentPanel) {
        render();
        
      }
    }) : (() => {});
    panel.onDidDispose(() => {
      activeEditorListener.dispose();
      removeListener && removeListener();
    });
    panel.webview.onDidReceiveMessage(async (msg) => {
      output.appendLine(`[BMS] Received message: ${JSON.stringify(msg)}`);
      if (msg.type === 'openLocation' && Number.isInteger(msg.line)) {
        output.appendLine(`[BMS] Processing openLocation: line=${msg.line}, column=${msg.column}`);
        try {
          let targetDoc = null;
          if (msg.fsPath) {
            output.appendLine(`[BMS] Opening file: ${msg.fsPath}`);
            const u = vscode.Uri.file(msg.fsPath);
            targetDoc = await vscode.workspace.openTextDocument(u);
          } else if (sourceDocument) {
            output.appendLine(`[BMS] Using source document: ${sourceDocument.uri.toString()}`);
            targetDoc = sourceDocument;
          } else if (vscode.window.activeTextEditor) {
            output.appendLine(`[BMS] Using active editor document`);
            targetDoc = vscode.window.activeTextEditor.document;
          }
          if (!targetDoc) {
            output.appendLine(`[BMS] No target document found`);
            return;
          }
          output.appendLine(`[BMS] Opening document: ${targetDoc.uri.toString()}`);
          const ed = await vscode.window.showTextDocument(targetDoc, { preview: false, viewColumn: vscode.ViewColumn.One });
          const p = new vscode.Position(Math.max(0, msg.line), Math.max(0, Number.isInteger(msg.column) ? msg.column : 0));
          output.appendLine(`[BMS] Revealing position: line=${p.line}, character=${p.character}`);
          ed.revealRange(new vscode.Range(p, p), vscode.TextEditorRevealType.InCenter);
          ed.selection = new vscode.Selection(p, p);
          output.appendLine(`[BMS] Successfully navigated to location`);
        } catch (e) {
          output.appendLine('[BMS] Failed to open location: ' + (e && e.message));
        }
      } else {
        output.appendLine(`[BMS] Message ignored: type=${msg.type}, line=${msg.line}, isInteger=${Number.isInteger(msg.line)}`);
      }
    }, undefined, context.subscriptions);
  });
  const subs = [hoverDisposable, cmd, statsCmd, statusBar, output];
  if (lintEngine && lintEngine.diagnosticCollection) {
    subs.unshift(lintEngine.diagnosticCollection);
  }
  context.subscriptions.push(...subs);

  const analyzeIfSupported = (doc) => {
    try {
      if (lintEngine && typeof lintEngine.shouldAnalyze === 'function' && lintEngine.shouldAnalyze(doc)) {
        lintEngine.analyze(doc);
      }
    } catch (e) {
      try { console.error('[BMS] analyzeIfSupported failed:', e && e.message); } catch(_) {}
    }
  };
  (vscode.workspace.textDocuments || []).forEach(analyzeIfSupported);
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(analyzeIfSupported),
    vscode.workspace.onDidChangeTextDocument((e) => analyzeIfSupported(e.document)),
    vscode.workspace.onDidSaveTextDocument(analyzeIfSupported)
  );
  // Agente JS removido

  
}

function deactivate() {
  if (lintEngine && lintEngine.diagnosticCollection) {
    lintEngine.diagnosticCollection.dispose();
  }
}

module.exports = { activate, deactivate };
