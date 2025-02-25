import * as vscode from 'vscode';
import * as files from 'fs';
import Parser, { Query } from 'tree-sitter';

export function register(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('ugsance.tree_sitter', useTreeSitter),
        // other commands
    );
}

function useTreeSitter() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        console.log("No file opened!");
        return;
    }
    const document = editor.document;
    const languageId = document.languageId;
    const code = // document.getText();
        files.readFileSync(document.uri.fsPath, 'utf8');

    console.log([
        `Path: ${document.uri.path}`,
        `Language: ${languageId}`,
        // `Contents: \n${code}`,
    ].join('\n'));

    const parser = new Parser();
    const language = require(`tree-sitter-${languageId}`);
    if (!language) {
        console.log("No language!");
        return;
    }
    parser.setLanguage(language);

    const tree = parser.parse(code);
    const query = new Query(language,
        `( variable_declarator ( identifier ) @names)`,
    );

    const variables: string[] = query.captures(tree.rootNode)
        .map(node => node.node.text);

    vscode.window.showInformationMessage(variables.toString());
    console.log(variables);
}
