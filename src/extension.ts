import * as vscode from 'vscode';

import * as lang_feats from './lang-feats';
import * as tree_sitter from './tree-sitter';

export function activate(context: vscode.ExtensionContext) {
	lang_feats.register(context);
	tree_sitter.register(context);

	function api() { }

	return { api };
}

export function deactivate() { }
