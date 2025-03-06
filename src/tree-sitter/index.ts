import * as vs from 'vscode';
import * as ut from '../utils';
import * as T from 'web-tree-sitter';

import { Configuration } from '../config';
import * as cmd from '../command';
import { Parser } from './parsers/model';

import { tags } from './queries';

import * as w from '../window';
import { MultiStepInput } from '../window/model';
import { executeFeatureProvider } from '../lang-features';

export function register(context: vs.ExtensionContext, parser: Parser, config: Configuration) {
    context.subscriptions.push(vs.commands.registerCommand(cmd.name(cmd.Command.TreeSitter), () => {
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
    // TODO: It's better to store a single entity (node, index, ?..)
    value: T.SyntaxNode[],
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
    const title = 'Define new callback';
    await MultiStepInput.run(input => pickCallUnit(input, state));

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
            title, step: 1, totalSteps: 3, items,
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

        return (input: MultiStepInput) => pickNode(input, state);
    }

    async function pickNode(input: MultiStepInput, state: Partial<State>) {
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
                case 'Loop':
                    await w.cursorJump(
                        editor!, line, offset,
                        item.label.length,
                    );
                    break;
                case 'Flow':
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
        switch (state.chosenNode!.detail) {
            case '':
                state.value = jumps;
                break;
            case 'Flow':
                state.value = flows;
                break;
            case 'Loop':
                state.value = loops;
                break;
        }
        return (input: MultiStepInput) => nameCallback(input, state);
    }

    async function nameCallback(input: MultiStepInput, state: Partial<State>) {
        const inputName = await input.showInputBox({
            title, step: 3, totalSteps: 3,
            value: buildNames(state, state.value!),
            prompt: 'Set a name for the new callback',
        });
        const point = state.callUnit!.node.startPosition;
        const position = new vs.Position(point.row, point.column);
        editor!.selection = new vs.Selection(position, position);

        const amount = (await executeFeatureProvider(editor!, cmd.name(cmd.vsCommand.references))).length;
        const callName = state.callUnit!.label.split('(')[0];
        const detail = [
            `Do you really want to place callback in chosen call unit (${callName})?`,
            `It's used by your code in exactly ${amount} places!`,
        ].join('\n');
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

function buildNames(state: Partial<State>, nodes: T.SyntaxNode[]) {
    return state.callUnit!.label.split('(')[0] + '_'
        + state.chosenNode!.label.split(' ')[0].split('(')[0] + '_'
        + (1 + nodes.findIndex(item => state.chosenNode!.node === item));
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
