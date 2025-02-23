import * as vscode from 'vscode';
import * as utils from './utils';

export function activate(context: vscode.ExtensionContext) {
	utils.register(context);

	function api() { }

	return { api };
}

export function deactivate() { }
