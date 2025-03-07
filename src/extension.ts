import * as vs from 'vscode';
import { Configuration } from './vscode/commands/model';

import * as LSP from './features/test';

import T from "web-tree-sitter";
import * as TreeSitter from './features';
import { Parser } from './tree-sitter/parsers/model';

export async function activate(context: vs.ExtensionContext) {
	const config = new Configuration();

	await T.init();
    const parser = new Parser();

	LSP.register(context);
	TreeSitter.register(context, parser, config);

	function api() { }

	return { api };
}

export function deactivate() { }
