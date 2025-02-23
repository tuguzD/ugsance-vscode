import * as vscode from 'vscode';

const Parser = require('tree-sitter');
const Java = require('tree-sitter-java');

const parser = new Parser();
parser.setLanguage(Java);

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "ugsance" is now active!');

	var refApi = vscode.extensions.getExtension('vscode.references-view')!;
	refApi.activate();
	const checkPlugin = vscode.commands.registerCommand('ugsance.check', () => {
		let greeting = [
			`Core "References" plugin is ${refApi.isActive ? '' : 'NOT '}active`,
		].join(' ');
		vscode.window.showInformationMessage(greeting);
	});

	// const disposable = vscode.languages.registerReferenceProvider('plaintext', new Provider());
	const useTreeSitter = vscode.commands.registerCommand('ugsance.treeSitter', () => {
		let document = vscode.window.activeTextEditor!.document;
		console.log([
			`Path: ${document.uri.path}`,
			// `Contents: \n${document.getText()}`,
		].join('\n'));

		const tree = parser.parse(document.getText());
		// console.log('\n', tree.rootNode.toString());

		const variables: any = [];
		function variableNames(node: any) {
			if (node.type === 'variable_declarator') {
				for (let child of node.namedChildren)
					if (child.type === 'identifier') variables.push(child.text);
			}
			for (let child of node.namedChildren) {
				variableNames(child);
			}
		}
		variableNames(tree.rootNode);
		vscode.window.showInformationMessage(variables.toString());
	});

	const references = vscode.commands.registerCommand('ugsance.references', () => {
		executeReferenceProvider(vscode.window.activeTextEditor!);
	});

	context.subscriptions.push(
		checkPlugin,
		useTreeSitter,
		references,
	);
}

async function executeReferenceProvider(editor: vscode.TextEditor) {
	const refs = await vscode.commands.executeCommand<vscode.Location[]>(
		'vscode.executeReferenceProvider',
		editor.document.uri, editor.selection.active,
	);

	var result: string[] = [];
	for (var ref of refs) result.push(
		`Line: ${ref.range.start.line.toString()} + ` +
		`Char: ${ref.range.start.character.toString()}`
	);
	vscode.window.showInformationMessage(result.toString());

	// for (const ref of refs) console.log(ref.range.start);
	console.log(result);
}

export function deactivate() { }
