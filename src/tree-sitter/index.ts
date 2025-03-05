import * as vs from 'vscode';
import * as ut from '../utils';

import { Configuration } from '../config';
import { Command, name } from '../command';
import { Parser } from './parsers/model';

import { tags } from './queries';

// import { MultiStepInput } from '../window/model';

export function register(context: vs.ExtensionContext, parser: Parser, config: Configuration) {
    context.subscriptions.push(vs.commands.registerCommand(name(Command.TreeSitter), () => {
        useTreeSitter(parser, config);
    }));
}

async function useTreeSitter(parser: Parser, config: Configuration) {
    const editor = vs.window.activeTextEditor;
    try {
        ut.nullCheck(editor, `No text editor opened!`);
        await parser.setLanguage(
            editor.document.languageId, config.userFolder);
        parser.parse(editor.document.getText());
    } catch (e: any) {
        vs.window.showErrorMessage(e.message);
        console.log(e.message);
    }
    const language = parser.langData;

    const callUnits = parser.captures(language.callUnit.toString());

    // todo
    const callNames = callUnits.filter([tags.unit.name!]);
    // console.log(callNames.nodes.map(item =>
    //     `${item.startPosition.row}:${item.startPosition.column}`
    // ));
    const callArgs = callUnits.filter([tags.unit.args]);
    const callBodies = callUnits.filter([tags.unit.body!]);

    let items: any[] = ut.mergeOrdered(
        callNames.nodesText, callArgs.nodesText,
    );
    items = ut.nestSeq(items, 2).map(item => item.join(''));
    console.log(items);

    // todo
    const chosenCallBody = callBodies.nodes[0];
    console.log(chosenCallBody.text);

    // todo
    const flows = parser.captures(
        language.flow.toString(), chosenCallBody,
    );
    const flowBodies = flows.filter([tags.flow.body!]);
    const chosenFlowBody = flowBodies.nodes[0];
    console.log(chosenFlowBody.text);

    // let state = {} as Partial<State>;
    // await MultiStepInput.run(input => pickResourceGroup(input, state));
    // // state = state as State;
    // vs.window.showInformationMessage(`COMMAND COMPLETED!!!`);

    // async function pickResourceGroup(input: MultiStepInput, state: Partial<State>) {
    //     state.resourceGroup = await input.showQuickPick({
    //         title: '',
    //         step: 1, totalSteps: 2,
    //         placeholder: '...',
    //         items: [], activeItem: state.resourceGroup,
    //         // onHighlight: (items: vs.QuickPickItem[]) =>
    //         //     console.log(`HELLO FROM INDEX!!! ${items[0].label}`),
    //     });
    //     return (input: MultiStepInput) => pickRuntime(input, state);
    // }

    // async function pickRuntime(input: MultiStepInput, state: Partial<State>) {
    //     state.runtime = await input.showQuickPick({
    //         title: '',
    //         step: 2, totalSteps: 2,
    //         placeholder: '...',
    //         items: [], activeItem: state.runtime,
    //     });
    // }
}

// interface State {
//     title: string, step: number, totalSteps: number,
//     resourceGroup: vs.QuickPickItem,
//     name: string, runtime: vs.QuickPickItem,
// }
