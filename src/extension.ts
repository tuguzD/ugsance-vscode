import * as vs from 'vscode';
import { Configuration } from './vscode/commands/model';

import * as Features from './features';
import * as Test from './features/items/test';

import T from "web-tree-sitter";
import { Parser } from './tree-sitter/parsers/model';

export async function activate(context: vs.ExtensionContext) {
	const config = new Configuration();

	await T.init();
    const parser = new Parser();

	Features.register(context, parser, config);
	Test.register(context);

	function ext_api() { }
	return { ext_api };
}

export function deactivate() { }
