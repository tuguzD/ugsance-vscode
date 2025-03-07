import * as vs from 'vscode';
import { Configuration } from './vscode/commands/model';

import * as Test from './features/items/test';
import * as Callback from './features/items/callback';

import T from "web-tree-sitter";
import { Parser } from './tree-sitter/parsers/model';

export async function activate(context: vs.ExtensionContext) {
	const config = new Configuration();

	await T.init();
    const parser = new Parser();

	Test.register(context);
	Callback.register(context, parser, config);

	function api() { }

	return { api };
}

export function deactivate() { }
