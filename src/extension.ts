import * as vscode from 'vscode';
import { Configuration } from './config';

import * as LSP from './lang-features';

import T from "web-tree-sitter";
import * as TreeSitter from './tree-sitter';
import { Parser } from './tree-sitter/parsers/model';

export async function activate(context: vscode.ExtensionContext) {
	const config = new Configuration();

	await T.init();
    const parser = new Parser();

	LSP.register(context);
	TreeSitter.register(context, parser, config);

	function api() { }

	return { api };
}

export function deactivate() { }
