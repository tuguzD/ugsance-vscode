import * as vscode from 'vscode';
import * as files from 'fs';

import { languages } from './languages';
import * as query from './queries';
import * as fun from './queries/function';

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
    const langData = languages.find(item => item.vscodeId == languageId);
    if (!langData) {
        const message = `The language '${languageId}' is not (currently) supported`;
        vscode.window.showErrorMessage(message);
        console.log(message);
        return;
    }

    const config = vscode.workspace.getConfiguration('UGsance');
    const userFolder = config.get<string>('tree-sitter.pathToWASM');
    if (!userFolder || userFolder === "") {
        const message = `You should set up folder for parsers (WASM files)!`;
        vscode.window.showWarningMessage(message);
        console.log(message);
        return;
    }
    const parserPath = `${userFolder}\\tree-sitter-${languageId}.wasm`;
    if (!files.existsSync(parserPath)) {
        const message = `No parser for '${languageId}' located!`;
        vscode.window.showErrorMessage(message);
        console.log(message);
        return;
    }

    const { lang, node } = await query.initLanguage(
        parserPath, editor.document.getText(),
    );
    const captures = query.captures(node, langData.function, lang);
    const functions = query.filterTag(captures, fun.tag.name);
    // functions.forEach(item => console.log(
    //     `${item.node.startPosition.row}:${item.node.startPosition.column}`
    // ));

    const functionsNames = functions.map(capture => capture.node.text);
    vscode.window.showInformationMessage(functionsNames.toString());
    console.log(functionsNames);
}
