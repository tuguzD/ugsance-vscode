import * as vscode from 'vscode';

import * as tree_sitter from './tree-sitter';
import * as lang_features from './lang-feats';

export function activate(context: vscode.ExtensionContext) {
	tree_sitter.register(context);
	lang_features.register(context);

	function api() { }

	return { api };
}

export function deactivate() { }
