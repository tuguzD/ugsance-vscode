import * as vscode from 'vscode';
import Parser from 'tree-sitter';
const Java = require('tree-sitter-java');

export function register(context: vscode.ExtensionContext) {
    context.subscriptions.push(
		vscode.commands.registerCommand('ugsance.treeSitter', useTreeSitter),
        // other commands
	);
}

const parser = new Parser();
parser.setLanguage(Java);

function useTreeSitter() {
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
}
