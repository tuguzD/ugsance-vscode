import * as vscode from 'vscode';
import * as files from 'fs';
import { nullCheck } from '../utils';

import { list } from './languages/model';
import * as query from './queries';
import { tags } from './queries/tag';

export function register(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('UGsance.tree_sitter', useTreeSitter),
    );
}

async function useTreeSitter() {
    try {
        const editor = vscode.window.activeTextEditor;
        nullCheck(editor, `No text editor opened!`);
        const { langData, parserPath } = getLanguage(editor.document.languageId);

        const { langParser, node } = await query.init(
            parserPath, editor.document.getText(),
        );
        const captures = query.captures(
            node, query.buildQuery(langData.callUnit), langParser,
        );
        const functions = query.filterTag(captures, tags.unit.name);
        // functions.forEach(item => console.log(
        //     `${item.node.startPosition.row}:${item.node.startPosition.column}`
        // ));

        const functionsNames = functions.map(capture => capture.node.text);
        vscode.window.showInformationMessage(functionsNames.toString());
        console.log(functionsNames);

        const firstBody = query.filterTag(captures, tags.unit.body)[0].node;
        console.log(
            query.filterTag(captures, tags.unit.body)[0].node.text,
        );
        const lol = query.captures(
            firstBody, query.buildQuery(langData.flow), langParser,
        );
        console.log(
            query.filterTag(lol, tags.flow.body)[0].node.text,
        );

    } catch (e: any) {
        vscode.window.showErrorMessage(e.message);
        console.log(e.message);
    }
}

function getLanguage(languageId: string) {
    const langData = list.find(item => item.vscodeId == languageId);
    nullCheck(langData, `The language '${languageId}' is not (currently) supported`);

    const config = vscode.workspace.getConfiguration('UGsance');
    const userFolder = config.get<string>('tree-sitter.pathToWASM');
    nullCheck(
        userFolder && userFolder.trim() !== '',
        `You should set up folder for parsers (WASM files)!`,
    );

    const parserPath =
        `${userFolder}\\tree-sitter-${languageId}.wasm`;
    nullCheck(
        files.existsSync(parserPath),
        `No parser for '${languageId}' located!`,
    );

    return { langData, parserPath };
}
