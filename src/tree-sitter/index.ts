import * as vs from 'vscode';
import * as ut from '../utils';

import { Configuration } from '../config';
import { Command, name } from '../command';
import { Parser } from './parsers/model';

import { tags } from './queries';

import * as w from '../window';
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
    vs.window.showInformationMessage(`COMMAND COMPLETED!!!`);

    async function pickCallUnit(input: MultiStepInput, state: Partial<State>) {
        const callNames = callUnits.filter([tags.unit.name!]);
        const callArgs = callUnits.filter([tags.unit.args]);

        let calls = ut.mergeOrdered(
            callNames.nodesText, callArgs.nodesText);
        calls = ut.nestSeq(calls, 2).map(item => item.join(''));

        const items = calls.map(label => ({ label }));
        state.callUnit = await input.showQuickPick({
            title: 'Define new callback',
            step: 1, totalSteps: 3, items: items,
            placeholder: `Select a call unit that'll launch new callback`,
            activeItem: items.find(item => item.label === state.callUnit?.label),
            onHighlight: async (items) => {
                const index = calls.indexOf(items[0].label);
                const callUnit = callNames.nodes[index];
                await w.cursorJump(editor!,
                    callUnit.startPosition.row,
                    callUnit.startPosition.column,
                    callUnit.endPosition.column,
                );
            },
        });
        state.callUnitIndex = items.indexOf(state.callUnit);
        return (input: MultiStepInput) => pickNextStep(input, state);
    }

    async function pickNextStep(input: MultiStepInput, state: Partial<State>) {
        const options = new Map([
            ['Pick from something', pick],
            // ['Try again lol =)', pick],
        ]);
        const items = [...options.keys()].map(label => ({ label }));
        const option = await input.showQuickPick({
            title: 'Choose the next step',
            items: items, placeholder: `...`,
        });
        const callback = options.get(option.label);
        return (input: MultiStepInput) => callback!(input, state);
    }

    async function pick(input: MultiStepInput, state: Partial<State>) {
        const callBodies = callUnits.filter([tags.unit.body!]);
        const chosenCallBody = callBodies.nodes[state.callUnitIndex!];

        const flowCaptures = parser.captures(language.flow.toString(), chosenCallBody),
            loopCaptures = parser.captures(language.loop.toString(), chosenCallBody),
            jumpCaptures = parser.captures(language.jump.toString(), chosenCallBody);

        const flows = flowCaptures.filter([tags.flow.body!]),
            loops = loopCaptures.filter([tags.loop.item]),
            jumps = jumpCaptures.filter([tags.jump.item]);

        const lol = [
            ...flows.nodes, ...loops.nodes, ...jumps.nodes,
        ];
        lol.sort((a, b) => a.startPosition.row - b.startPosition.row);
        console.log(lol.map(item => item.startPosition.row));

        // let calls = ut.mergeOrdered(
        //     flows.nodesText, loops.nodesText, jumps.nodesText);
        // calls = ut.nestSeq(calls, 3).map(item => item.join(''));

        // const chosenFlowBody = flows.nodes[0];
        // console.log(chosenFlowBody.text);

        state.callUnit = await input.showQuickPick({
            items: [],
        });
    }
}

interface State {
    title: string, step: number, totalSteps: number,
    callUnit: vs.QuickPickItem, callUnitIndex: number,
    name: string, runtime: vs.QuickPickItem,
}
