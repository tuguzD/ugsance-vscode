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
    chosenNode: QuickPickNode,
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
    // vs.window.showInformationMessage(`COMMAND COMPLETED!!!`);

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

        return (input: MultiStepInput) => pickNodes(input, state);
    }

    async function pickNodes(input: MultiStepInput, state: Partial<State>) {
        const jumps = parser.captures(language.jump.toString(), state.callUnitBody)
            .filter([tags.jump.item]).nodes;
        const loops = parser.captures(language.loop.toString(), state.callUnitBody)
            .filter([tags.loop.item]).nodes;
        const flows = parser.captures(language.flow.toString(), state.callUnitBody)
            .filter([tags.flow.body!]).nodes;

        const jumpItems = jumps.map(node => ({
            node, description: 'Jump', detail: '',
            label: node.text.split(';')[0].trim(),
        }));
        const loopItems = loops.map(node => {
            const textBody = editor!.document.lineAt(new vs.Position(
                node.startPosition.row + 1, 0)).text;
            return {
                node, detail: 'Loop',
                description: textBody.trim(),
                label: node.text.split('{')[0].trim(),
            };
        });
        const flowItems = flows.map(node => {
            const text = editor!.document.lineAt(new vs.Position(
                node.startPosition.row, node.startPosition.column,
            )).text;
            return {
                node, detail: 'Flow',
                description: node.text.split('\n')[1].trim(),
                label: text.trim().replace('} ', '').replace(' {', ''),
            };
        });
        const items = [...flowItems, ...loopItems, ...jumpItems];
        items.sort((a, b) => a.node.startPosition.row - b.node.startPosition.row);

        const onHighlight = async (items: QuickPickNode[]) => {
            const item = items[0];
            const line = item.node.startPosition.row;
            const offset = item.node.startPosition.column;
            switch (item.detail) {
                case '':
                case 'Loop': {
                    await w.cursorJump(
                        editor!, line, offset,
                        item.label.length,
                    );
                    break;
                }
                case 'Flow': {
                    const character = editor!.document.lineAt(
                        new vs.Position(line, offset),
                    ).firstNonWhitespaceCharacterIndex;

                    await w.cursorJump(editor!, line, character, offset);
                    break;
                }
            }
        };
        state.chosenNode = await input.showQuickPick<QuickPickNode>({
            title: `Define new callback`,
            placeholder: `Select a place where new callback will be launched`,
            items, onHighlight, step: 2, totalSteps: 3,
        });
        switch (state.chosenNode.detail) {
            case '': {
                vs.window.showInformationMessage(`"Jump" chosen`);
                break;
            }
            case 'Loop': {
                vs.window.showInformationMessage(`"Loop" chosen`);
                break;
            }
            case 'Flow': {
                vs.window.showInformationMessage(`"Flow" chosen`);
                break;
            }
        }
        // return (input: MultiStepInput) => pickNextStep(input, state);
    }
}
