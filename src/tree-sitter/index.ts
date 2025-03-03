import * as vscode from 'vscode';
import { nullCheck } from '../utils';

import { Parser } from './parsers/model';
import { tags } from './queries';

export function register(context: vscode.ExtensionContext, parser: Parser) {
    context.subscriptions.push(vscode.commands.registerCommand(
        'UGsance.tree_sitter', () => { useTreeSitter(parser) },
    ));
}

async function useTreeSitter(parser: Parser) {
    try {
        const editor = vscode.window.activeTextEditor;
        nullCheck(editor, `No text editor opened!`);

        const config = vscode.workspace.getConfiguration('UGsance');
        const userFolder = config.get<string>('tree-sitter.pathToWASM');
        nullCheck(
            userFolder && userFolder.trim() !== '',
            `You should set up folder for parsers (WASM files)!`,
        );

        await parser.setLanguage(
            editor.document.languageId, userFolder,
        );
        parser.parse(editor.document.getText());

        const captures = parser.captures(
            parser.langData.callUnit.toString(),
        );

        const functions = captures.filter(tags.unit.name);
        // functions.list.forEach(item => console.log(
        //     `${item.node.startPosition.row}:${item.node.startPosition.column}`
        // ));
        const functionsNames = functions.list.map(capture => capture.node.text);
        vscode.window.showInformationMessage(functionsNames.toString());
        console.log(functionsNames);

        const firstBody = captures.filter(tags.unit.body).list[0].node;
        console.log(firstBody.text);

        const lol = parser.captures(
            parser.langData.flow.toString(), firstBody,
        );
        console.log(
            lol.filter(tags.flow.body).list[0].node.text,
        );

    } catch (e: any) {
        vscode.window.showErrorMessage(e.message);
        console.log(e.message);
    }
}
