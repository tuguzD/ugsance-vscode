import * as vs from 'vscode';
import * as ut from '../utils';

import { Configuration } from '../config';
import { Command, name } from '../command';
import { Parser } from './parsers/model';

import { tags } from './queries';

import { MultiStepInput } from '../window/model';

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
        return;
    }
    const language = parser.langData;
    const callUnits = parser.captures(language.callUnit.toString());

    let state = {} as Partial<State>;
    await MultiStepInput.run(input => pickCallUnit(input, state));
    // state = state as State;
    vs.window.showInformationMessage(`COMMAND COMPLETED!!!`);

    async function pickCallUnit(input: MultiStepInput, state: Partial<State>) {
        const callNames = callUnits.filter([tags.unit.name!]);
        const callArgs = callUnits.filter([tags.unit.args]);

        let calls: any[] = ut.mergeOrdered(
            callNames.nodesText, callArgs.nodesText);
        calls = ut.nestSeq(calls, 2).map(item => item.join(''));

        const items: vs.QuickPickItem[] = calls.map(label => ({ label }));
        state.callUnit = await input.showQuickPick({
            title: 'Define new callback',
            step: 1, totalSteps: 2, items: items,
            placeholder: `Select a call unit that'll launch new callback`,
            activeItem: items.find(item => item.label === state.callUnit?.label),
            onHighlight: async (items: vs.QuickPickItem[]) => {
                const index = calls.indexOf(items[0].label);
                const callUnit = callNames.nodes[index];
                const point = callUnit.startPosition;

                const position = new vs.Position(point.row + 1, point.column);
                editor!.selection = new vs.Selection(position, position);
                await vs.commands.executeCommand('cursorMove', { to: 'up' });

                editor!.selection = new vs.Selection(
                    new vs.Position(point.row, point.column),
                    new vs.Position(point.row, callUnit.endPosition.column),
                );
            },
        });
        return (input: MultiStepInput) => pickRuntime(input, state);
    }
    const callBodies = callUnits.filter([tags.unit.body!]);

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

    async function pickRuntime(input: MultiStepInput, state: Partial<State>) {
        state.runtime = await input.showQuickPick({
            title: '',
            step: 2, totalSteps: 2,
            placeholder: '...',
            items: [], activeItem: state.runtime,
        });
    }
}

interface State {
    title: string, step: number, totalSteps: number,
    callUnit: vs.QuickPickItem,
    name: string, runtime: vs.QuickPickItem,
}
