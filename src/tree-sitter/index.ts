import * as vscode from 'vscode';
import * as files from 'fs';
import Parser from 'web-tree-sitter';

import { languages as langsData } from './parsing/languages';
import * as queries from './parsing/queries';

export function register(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('UGsance.tree_sitter', useTreeSitter),
    );
}

async function useTreeSitter() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        const message = `No text editor opened!`;
        vscode.window.showErrorMessage(message);
        console.log(message);
        return;
    }
    const languageId = editor.document.languageId;

    const config = vscode.workspace.getConfiguration('UGsance');
    const userFolder = config.get<string>('tree-sitter.pathToWASM');
    if (userFolder === "") {
        const message = `You should set up folder for parsers (WASM files)!`;
        vscode.window.showWarningMessage(message);
        console.log(message);
        return;
    }

    const path = `${userFolder}\\tree-sitter-${languageId}.wasm`;
    if (!files.existsSync(path)) {
        const message = `No parser for '${languageId}' located!`;
        vscode.window.showErrorMessage(message);
        console.log(message);
        return;
    }
    const { parser, lang } = await initLanguage(path);
    const tree = parser.parse(editor.document.getText());

    const langData = langsData.filter(item => item.vscodeId == languageId)[0];
    if (!langData || langData.function.length === 0) {
        const message = `The language '${languageId}' is not (currently) supported`;
        vscode.window.showErrorMessage(message);
        console.log(message);
        return;
    }

    const functions = lang.query(
        queries.functions(langData)
    ).captures(tree.rootNode).filter(
        capture => capture.name === 'name'
    );
    // for (let item of functions)
    //     console.log(item.node.toString());
    const functionsNames = functions.map(capture => capture.node.text);

    vscode.window.showInformationMessage(functionsNames.toString());
    console.log(functionsNames);
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
