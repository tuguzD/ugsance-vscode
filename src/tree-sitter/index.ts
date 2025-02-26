import * as vscode from 'vscode';
import * as files from 'fs';
import Parser from 'web-tree-sitter';

export function register(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('UGsance.tree_sitter', useTreeSitter),
    );
}

async function useTreeSitter() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        console.log('No text editor opened!');
        return;
    }
    const languageId = (editor.document.languageId == 'csharp') ? 'c-sharp' : editor.document.languageId;

    const config = vscode.workspace.getConfiguration('UGsance');
    const userFolder = config.get<string>('tree-sitter.pathToWASM');

    const path = `${userFolder}\\tree-sitter-${languageId}.wasm`;

    if (!files.existsSync(path)) {
        console.log(`No parser for '${languageId}' located!`);
        return;
    }
    const { parser, lang } = await initLanguage(path);
    const tree = parser.parse(editor.document.getText());
    // console.log(tree.rootNode.toString());

    const variable: string = languageId == 'java'
        ? 'method_declaration' : 'variable_list';
    const variablesQuery = `( ${variable} ( identifier ) @variables)`;

    const query = lang.query(variablesQuery);
    const variables: string[] = query.captures(tree.rootNode)
        .map(capture => capture.node.text);

    vscode.window.showInformationMessage(variables.toString());
    console.log(variables);
}

async function initLanguage(path: string) {
    await Parser.init();
    const parser = new Parser();
    const lang = await Parser.Language.load(path);
    parser.setLanguage(lang);

    // const queryText = files.readFileSync('', "utf-8");
    // const highlightQuery = lang.query(queryText);
    return { parser, lang };
}

async function executeDocumentSymbolProvider() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        console.log('No text editor opened!');
        return;
    }
    const symbols: any = await
        vscode.commands.executeCommand<vscode.SymbolInformation[] | vscode.DocumentSymbol[]>(
            'vscode.executeDocumentSymbolProvider', editor.document.uri,
        ).then(symbols => symbols.map(item => {
            console.log(item);
            return item;
        }));
    console.log('\n', `Command 'vscode.executeDocumentSymbolProvider' was successfully called`);
}
