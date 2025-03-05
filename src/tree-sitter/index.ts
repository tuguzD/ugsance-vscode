import * as vs from 'vscode';
import * as ut from '../utils';
import * as T from 'web-tree-sitter';

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

interface QuickPickNode extends vs.QuickPickItem {
    node: T.SyntaxNode,
}
interface State {
    title: string, step: number, totalSteps: number,
    callUnit: vs.QuickPickItem, callUnitBody: T.SyntaxNode,
    name: string, runtime: vs.QuickPickItem,
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

    let state = {} as Partial<State>;
    await MultiStepInput.run(input => pickCallUnit(input, state));
    vs.window.showInformationMessage(`COMMAND COMPLETED!!!`);

    async function pickCallUnit(input: MultiStepInput, state: Partial<State>) {
        const callUnits = parser.captures(language.callUnit.toString());

        const callNames = callUnits.filter([tags.unit.name!]);
        const callArgs = callUnits.filter([tags.unit.args]);

        let calls = ut.mergeOrdered(
            callNames.nodesText, callArgs.nodesText);
        calls = ut.nestSeq(calls, 2).map(item => item.join(''));

        const items = calls.map(label => ({ label }));
        state.callUnit = await input.showQuickPick({
            title: `Define new callback`,
            step: 1, totalSteps: 2, items,
            placeholder: `Select a "call unit" that'll launch new callback`,
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
        state.callUnitBody = callUnits.filter([tags.unit.body!])
            .nodes[items.indexOf(state.callUnit)];

        return (input: MultiStepInput) => pickNextStep(input, state);
    }

    async function pickNextStep(input: MultiStepInput, state: Partial<State>) {
        const steps = new Map([
            [`View "jump" statements (return, break, continue, goto...)`, pickJumps],
            // [`Pick empty test window`, pick],
        ]);
        const items = [...steps.keys()].map(label => ({ label }));
        const step = await input.showQuickPick({
            items, title: '...',
            placeholder: `Choose the next step`,
        });
        const callback = steps.get(step.label);
        return (input: MultiStepInput) => callback!(input, state);
    }

    async function pickJumps(input: MultiStepInput, state: Partial<State>) {
        const jumps = parser.captures(
            language.jump.toString(), state.callUnitBody,
        ).filter([tags.jump.item]).nodes;

        const items = jumps.map(item => ({
            label: item.text, node: item,
        }));
        await input.showQuickPick<QuickPickNode>({
            title: `Define new callback`,
            step: 2, totalSteps: 2, items,
            placeholder: `Select a "jump" statement before which new callback will be launched`,
            onHighlight: async (items) => {
                const jump = items[0].node;
                await w.cursorJump(editor!,
                    jump.startPosition.row,
                    jump.startPosition.column,
                    jump.endPosition.column,
                );
            },
        });
        // return (input: MultiStepInput) => pickNextStep(input, state);
    }

    // async function pick(input: MultiStepInput, state: Partial<State>) {
    //     const flowCaptures = parser.captures(language.flow.toString(), state.callUnitBody),
    //         loopCaptures = parser.captures(language.loop.toString(), state.callUnitBody),
    //         jumpCaptures = parser.captures(language.jump.toString(), state.callUnitBody);

    //     const flows = flowCaptures.filter([tags.flow.body!]),
    //         loops = loopCaptures.filter([tags.loop.item]),
    //         jumps = jumpCaptures.filter([tags.jump.item]);

    //     const lol = [
    //         ...flows.nodes, ...loops.nodes, ...jumps.nodes,
    //     ];
    //     lol.sort((a, b) => a.startPosition.row - b.startPosition.row);
    //     console.log(lol.map(item => item.startPosition.row));

    //     // let calls = ut.mergeOrdered(
    //     //     flows.nodesText, loops.nodesText, jumps.nodesText);
    //     // calls = ut.nestSeq(calls, 3).map(item => item.join(''));

    //     // const chosenFlowBody = flows.nodes[0];
    //     // console.log(chosenFlowBody.text);

    //     state.callUnit = await input.showQuickPick({
    //         items: [],
    //     });
    // }
}
