import * as vscode from 'vscode';
import { nullCheck } from '../utils';

import { Parser } from './parsers/model';
import { filter } from './queries';
import { tags } from './queries/tag';

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

        // const functions = filter(captures, tags.unit.name);
        // functions.forEach(item => console.log(
        //     `${item.node.startPosition.row}:${item.node.startPosition.column}`
        // ));
        // const functionsNames = functions.map(capture => capture.node.text);
        // vscode.window.showInformationMessage(functionsNames.toString());
        // console.log(functionsNames);

        const firstBody = filter(captures, tags.unit.body)[0].node;
        console.log(
            filter(captures, tags.unit.body)[0].node.text,
        );
        const lol = parser.captures(
            parser.langData.flow.toString(), firstBody,
        );
        console.log(
            filter(lol, tags.flow.body)[0].node.text,
        );
    } catch (e: any) {
        vscode.window.showErrorMessage(e.message);
        console.log(e.message);
    }
}
