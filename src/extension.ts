import * as vscode from 'vscode';

import * as TreeSitter from './tree-sitter';
import * as LSP from './lang-features';

export function activate(context: vscode.ExtensionContext) {
	TreeSitter.register(context);
	LSP.register(context);

	function api() { }

	return { api };
}

export function deactivate() { }
