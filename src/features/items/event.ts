
import * as vs from 'vscode';
import * as util from '../../utils';
import * as T from 'web-tree-sitter';

import { Configuration } from '../../vscode/commands/model';
import * as cmd from '../../vscode/commands';
import { Parser } from '../../tree-sitter/parsers/model';

import { tags } from '../../tree-sitter/queries';

import * as w from '../../vscode/inputs';
import { MultiStepInput } from '../../vscode/inputs/model';

import { executeFeatureProvider, checkEditor } from '..';
import { QuickPickNode, State } from '../model';

interface EventState extends State {
    callUnit: QuickPickNode, callUnitBody: T.SyntaxNode,
    chosenNode: QuickPickNode, callbackName: string,
}

export async function useTreeSitter(parser: Parser, config: Configuration) {
    const editor = await checkEditor(parser, config);
    if (!editor) { return; }
    const language = parser.langData;
    // console.log(language.call_data.toString());

    let state = {} as Partial<EventState>;
    const title = 'Define new callback';
    await MultiStepInput.run(input => pickCallUnit(input, state));

    async function pickCallUnit(input: MultiStepInput, state: Partial<EventState>) {
        const callUnits = parser.captures(language.call.toString());
        const callNames = callUnits.filter([tags.call.name!]),
            callArgs = callUnits.filter([tags.call.args]);

        // TODO: fix different lengths of 'name' and 'args' arrays
        // IDK how, because 'name' doesn't exist for lambdas and sync. statements (for Java)
        const names = callNames.nodesText,
            args = callArgs.nodesText,
            node = callNames.nodes;

        const items: QuickPickNode[] = names.map((value, index) => ({
            label: util.clean(value),
            description: args[index],
            detail: '', node: node[index],
        }));
        state.callUnit = await input.showQuickPick<QuickPickNode>({
            title, step: 1, totalSteps: 3, items,
            placeholder: `Select a "call unit" that'll launch new callback`,
            activeItem: items.find(item => item.label === state.callUnit?.label),
            onHighlight: async (items) => await w.cursorJump(editor!,
                items[0].node.startPosition.row,
                items[0].node.startPosition.column,
                items[0].label.split('(')[0].trim().length,
            ),
        });
        state.callUnitBody = callUnits.filter([tags.call.body!])
            .nodes[items.indexOf(state.callUnit)];

        return (input: MultiStepInput) => pickNode(input, state);
    }

    async function pickNode(input: MultiStepInput, state: Partial<EventState>) {
        const jumps = parser.captures(language.jump.toString(), state.callUnitBody)
            .filter([tags.jump.item]).nodes;
        const loops = parser.captures(language.loop.toString(), state.callUnitBody)
            .filter([tags.loop.item]).nodes;
        const flows = parser.captures(language.flow.toString(), state.callUnitBody)
            .filter([tags.flow.body!]).nodes;

        const jumpItems: QuickPickNode[] = jumps.map(node => ({
            node, description: 'Jump', type: 'jump',
            label: node.text.split(';')[0].trim(),
        }));
        const loopItems: QuickPickNode[] = loops.map(node => {
            const textBody = editor!.document.lineAt(new vs.Position(
                node.startPosition.row + 1, 0)).text;
            return {
                node, detail: 'Loop', type: 'loop',
                description: textBody.trim(),
                label: node.text.split('{')[0].trim(),
            };
        });
        const flowItems: QuickPickNode[] = flows.map(node => {
            const text = editor!.document.lineAt(new vs.Position(
                node.startPosition.row, node.startPosition.column,
            )).text;
            return {
                node, detail: 'Flow', type: 'flow',
                description: node.text.split('\n')[1].trim(),
                label: text.trim().replace('} ', '').replace(' {', ''),
            };
        });
        const bodyItems: QuickPickNode[] = [{ 
            label: 'Beginning of chosen call unit',
            type: 'body', detail: 'Body',
            node: state.callUnitBody!
        }];
        const items = [...bodyItems, ...flowItems, ...loopItems, ...jumpItems];
        items.sort((a, b) => a.node.startPosition.row - b.node.startPosition.row);

        const onHighlight = async (items: QuickPickNode[]) => {
            const item = items[0];
            const line = item.node.startPosition.row;
            const offset = item.node.startPosition.column;
            switch (item.type) {
                case 'jump':
                case 'loop':
                    await w.cursorJump(
                        editor!, line, offset,
                        item.label.length,
                    );
                    break;
                case 'body':
                case 'flow':
                    const character = editor!.document.lineAt(
                        new vs.Position(line, offset),
                    ).firstNonWhitespaceCharacterIndex;

                    await w.cursorJump(editor!, line, character, offset);
                    break;
            }
        };
        // Interaction with a user itself
        state.chosenNode = await input.showQuickPick<QuickPickNode>({
            title, step: 2, totalSteps: 3, items, onHighlight,
            activeItem: items.find(item => item.label === state.chosenNode?.label),
            placeholder: `Select a place where new callback will be launched`,
        });

        const nodes = ({
            'jump': jumps, 'flow': flows, 'loop': loops,
            'body': bodyItems,
        })[state.chosenNode.type!];
        state.callbackName = state.callUnit!.label.split('(')[0] + '_'
            + state.chosenNode!.label.split(' ')[0].split('(')[0] + '_'
            + (1 + nodes!.findIndex(item => state.chosenNode!.node === item));

        return (input: MultiStepInput) => nameCallback(input, state);
    }

    async function nameCallback(input: MultiStepInput, state: Partial<EventState>) {
        const inputName = await input.showInputBox({
            step: 3, totalSteps: 3,
            title, value: state.callbackName!,
            prompt: 'Set a name for the new callback',
        });
        const point = state.callUnit!.node.startPosition;
        const position = new vs.Position(point.row, point.column);
        editor!.selection = new vs.Selection(position, position);

        const amount = (await executeFeatureProvider(
            editor!, cmd.name(cmd.vsCommand.references)
        )).length;
        const callName = state.callUnit!.label.split('(')[0];
        const detail = [
            `Do you really want to place callback in chosen call unit (${callName})?`,
            amount > 0 ? `It's used by your code in exactly ${amount} places!` : '',
        ].filter(i => i !== '').join('\n');
        const confirmOption = 'Yes';

        const choice = await vs.window.showInformationMessage(
            title, { detail, modal: true }, confirmOption);
        if (choice !== confirmOption) { return; }

        let line = state.chosenNode!.node.startPosition.row;
        if (state.chosenNode!.detail !== '') { line++; }
        placeCallback(editor!, line, inputName);
        vs.commands.executeCommand('editor.action.addCommentLine');
    }
}

function placeCallback(editor: vs.TextEditor, line: number, name: string) {
    const character = editor!.document.lineAt(
        new vs.Position(line, 0),
    ).firstNonWhitespaceCharacterIndex;

    const args = `()`;
    const space = editor!.document.getText(new vs.Range(
        new vs.Position(line, 0),
        new vs.Position(line, character),
    ));
    const result = space + name + args + '\n';

    editor!.edit(i => i.insert(
        new vs.Position(line, 0), result,
    ));
    editor!.selection = new vs.Selection(
        new vs.Position(line, character),
        new vs.Position(line, result.length),
    );
}
