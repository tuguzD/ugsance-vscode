import * as vscode from 'vscode';

const Parser = require('tree-sitter');
const Java = require('tree-sitter-java');

const parser = new Parser();
parser.setLanguage(Java);

export function register(context: vscode.ExtensionContext) {
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
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            executeReferenceProvider(editor);
            console.log(editor.document.languageId);
        } else {
            console.log("No file opened!");
        }
    });

    context.subscriptions.push(
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
