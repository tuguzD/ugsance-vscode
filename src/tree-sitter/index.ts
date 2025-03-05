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
    callUnit: QuickPickNode, callUnitBody: T.SyntaxNode,
    name: string, runtime: QuickPickNode,
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
        const callNames = callUnits.filter([tags.unit.name!]),
            callArgs = callUnits.filter([tags.unit.args]);

        let calls = ut.mergeOrdered(
            callNames.nodesText, callArgs.nodesText);
        calls = ut.nestSeq(calls, 2).map(item => item.join(''));

        const items: QuickPickNode[] = calls.map((value, index) => ({
            label: value, node: callNames.nodes[index],
        }));
        state.callUnit = await input.showQuickPick<QuickPickNode>({
            title: `Define new callback`,
            step: 1, totalSteps: 2, items,
            placeholder: `Select a "call unit" that'll launch new callback`,
            activeItem: items.find(item => item.label === state.callUnit?.label),
            onHighlight: async (items) => await w.cursorJump(editor!,
                items[0].node.startPosition.row,
                items[0].node.startPosition.column,
                items[0].label.split('(')[0].trim().length,
            ),
        });
        state.callUnitBody = callUnits.filter([tags.unit.body!])
            .nodes[items.indexOf(state.callUnit)];

        return (input: MultiStepInput) => pickNextStep(input, state);
    }

    async function pickNextStep(input: MultiStepInput, state: Partial<State>) {
        const steps = new Map([
            [`View "jump" statements (return, break, continue, goto...)`, pickJumps],
            [`View various loops (for, for-each, (do-)while...)`, pickLoops],
            [`View various flows (if-else, switch, try-catch...)`, pickFlows],
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

        const items = jumps.map(node => ({
            node, label: node.text.split(';')[0].trim(),
        }));
        await input.showQuickPick<QuickPickNode>({
            title: `Define new callback`,
            step: 2, totalSteps: 2, items,
            placeholder: `Select a "jump" statement before which new callback will be launched`,
            onHighlight: async (items) => await w.cursorJump(editor!,
                items[0].node.startPosition.row,
                items[0].node.startPosition.column,
                items[0].label.length,
            ),
        });
        return (input: MultiStepInput) => pickNextStep(input, state);
    }

    async function pickLoops(input: MultiStepInput, state: Partial<State>) {
        const loops = parser.captures(
            language.loop.toString(), state.callUnitBody,
        ).filter([tags.loop.item]).nodes;

        const items = loops.map(node => ({
            node, label: node.text.split('{')[0].trim(),
        }));
        await input.showQuickPick<QuickPickNode>({
            title: `Define new callback`,
            step: 2, totalSteps: 3, items,
            placeholder: `Select a "loop" in which new callback will be (repeatedly) launched`,
            onHighlight: async (items) => await w.cursorJump(editor!,
                items[0].node.startPosition.row,
                items[0].node.startPosition.column,
                items[0].label.length,
            ),
        });
        return (input: MultiStepInput) => pickNextStep(input, state);
    }

    async function pickFlows(input: MultiStepInput, state: Partial<State>) {
        const flows = parser.captures(language.flow.toString(), state.callUnitBody);
        const flowBodies = flows.filter([tags.flow.body!]).nodes,
            flowItems = flows.filter([tags.flow.item]).nodes;

        const items: QuickPickNode[] = flowBodies.map((node, index) => ({
            label: flowItems[index].text.split('\n')[0].trim(),
            node, description: node.text.split('\n')[1].trim(),
        }));
        await input.showQuickPick<QuickPickNode>({
            title: `Define new callback`,
            step: 2, totalSteps: 3, items,
            placeholder: `Select a "flow" in case of which new callback will be launched`,
            onHighlight: async (items) => {
                const line = items[0].node.startPosition.row;
                const offset = items[0].node.startPosition.column;

                const character = editor!.document.lineAt(
                    new vs.Position(line, offset),
                ).firstNonWhitespaceCharacterIndex;

                await w.cursorJump(editor!, line, character, offset);
            }
        });
        return (input: MultiStepInput) => pickNextStep(input, state);
    }
}
