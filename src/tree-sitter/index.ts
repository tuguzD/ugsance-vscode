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

        const callUnits = parser.captures(
            parser.langData.callUnit.toString(),
        );

        // todo
        const callNames = callUnits.filter(tags.unit.name).list;
        // console.log(callNames.map(item => 
        //     `${item.node.startPosition.row}:${item.node.startPosition.column}`
        // ));
        const outputCalls = callNames.map(item => item.node.text);
        // vs.window.showInformationMessage(outputCalls.toString());
        console.log(outputCalls);

        // todo
        const callBodies = callUnits.filter(tags.unit.body).list;
        const chosenCallBody = callBodies[0].node;
        console.log(chosenCallBody.text);

        // todo
        const flows = parser.captures(
            parser.langData.flow.toString(), chosenCallBody,
        );
        const flowBodies = flows.filter(tags.flow.body).list;
        const chosenFlowBody = flowBodies[0].node;
        console.log(chosenFlowBody.text);

    } catch (e: any) {
        vs.window.showErrorMessage(e.message);
        console.log(e.message);
    }
}
