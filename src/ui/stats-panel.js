const vscode = require('vscode');

function nonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function getStatsHtml(model, webview, extensionUri) {
  const itemsJson = JSON.stringify(model.items || []);
  const n = nonce();
  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'ui', 'assets', 'stats.js'));
  const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'src', 'ui', 'assets', 'stats.css'));
  const csp = [
    `default-src 'none'`,
    `img-src ${webview.cspSource} https:`,
    `style-src ${webview.cspSource}`,
    `script-src 'nonce-${n}'`,
    `connect-src ${webview.cspSource}`
  ].join('; ');
  return `
  <html lang="pt-BR">
  <head>
    <meta http-equiv="Content-Security-Policy" content="${csp}">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="${styleUri}">
    <title>Box Model Sentinel • Stats</title>
  </head>
  <body>
    <section class="section css-section">
      <div class="counts">
        <div class="count-card critical ${Number(model?.counts?.critical ?? 0) > 0 ? 'has' : 'empty'}">
          <div class="count-num">${Number(model?.counts?.critical ?? 0)}</div>
          <div class="count-label">CRITICAL</div>
        </div>
        <div class="count-card medium ${Number(model?.counts?.medium ?? 0) > 0 ? 'has' : 'empty'}">
          <div class="count-num">${Number(model?.counts?.medium ?? 0)}</div>
          <div class="count-label">MEDIUM</div>
        </div>
        <div class="count-card low ${Number(model?.counts?.low ?? 0) > 0 ? 'has' : 'empty'}">
          <div class="count-num">${Number(model?.counts?.low ?? 0)}</div>
          <div class="count-label">LOW</div>
        </div>
      </div>
      <div class="list" id="list"></div>
    </section>
    <script nonce="${n}">window.__BMS_ITEMS__ = ${itemsJson};</script>
    <script nonce="${n}" src="${scriptUri}"></script>
  </body>
  </html>
  `;
}

module.exports = { getStatsHtml };
