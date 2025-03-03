import * as vs from 'vscode';
import { nullCheck } from '../utils';

import { Configuration } from '../config';
import { Command, name } from '../command';

import { tags } from './queries';
import { Parser } from './parsers/model';

export function register(
    context: vs.ExtensionContext,
    parser: Parser, config: Configuration,
) {
    context.subscriptions.push(vs.commands.registerCommand(
        name(Command.TreeSitter), () => { useTreeSitter(parser, config) },
    ));
}

async function useTreeSitter(parser: Parser, config: Configuration) {
    try {
        const editor = vs.window.activeTextEditor;
        nullCheck(editor, `No text editor opened!`);

        await parser.setLanguage(editor.document.languageId, config.userFolder);
        parser.parse(editor.document.getText());

        const captures = parser.captures(
            parser.langData.callUnit.toString(),
        );

        const functions = captures.filter(tags.unit.name);
        // functions.list.forEach(item => console.log(
        //     `${item.node.startPosition.row}:${item.node.startPosition.column}`
        // ));
        const functionsNames = functions.list.map(capture => capture.node.text);
        vs.window.showInformationMessage(functionsNames.toString());
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
        vs.window.showErrorMessage(e.message);
        console.log(e.message);
    }
}
