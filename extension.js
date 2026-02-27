// Main entry point - lazily delegate to src/extension/extension to avoid
// top-level require failures during extension host bootstrap.
function _safeLogToOutput(msg) {
	try {
		const vscode = require('vscode');
		const ch = vscode.window.createOutputChannel('Box Model Sentinel');
		ch.appendLine(msg);
		ch.show(true);
	} catch (e) {
		// fall back to console if vscode not available
		console.error('Box Model Sentinel bootstrap error:', msg, e && e.message);
	}
}

function activate(context) {
	try {
		// require inside activate so load-time errors outside activation don't block the host
		const ext = require('./src/extension/extension.js');
		if (ext && typeof ext.activate === 'function') {
			return ext.activate(context);
		}
		_safeLogToOutput('Loaded src extension but no activate() exported');
	} catch (err) {
		_safeLogToOutput('Failed to load src/extension/extension.js: ' + (err && err.message));
	}
}

function deactivate() {
	try {
		const ext = require('./src/extension/extension.js');
		if (ext && typeof ext.deactivate === 'function') {
			return ext.deactivate();
		}
	} catch (e) {
		// ignore
	}
}

module.exports = { activate, deactivate };
