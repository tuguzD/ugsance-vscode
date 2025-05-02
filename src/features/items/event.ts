
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
import { QueryItems } from '../../tree-sitter/queries/model';
import { Block } from '../../tree-sitter/queries/items/block';

interface EventState extends State {
    callNode: QuickPickNode, callBody: T.SyntaxNode,
    bodyNode: QuickPickNode, // args: QuickPickNode[] ???
    eventName: string,
}

export async function launch(parser: Parser, config: Configuration) {
    const editor = await checkEditor(parser, config);
    if (!editor) { return; }

    let state: Partial<EventState> = {
        title: 'Define new callback',
        editor, parser,
    };
    console.log(parser.language.call_data.str);
    await MultiStepInput.run(input => pickCallUnit(input, state));
}

async function pickCallUnit(input: MultiStepInput, state: Partial<EventState>) {
    const language = state.parser!.language;

    const callUnits = state.parser!.captures(language.call.str);
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
    state.callNode = await input.showQuickPick<QuickPickNode>({
        title: state.title, step: 1, totalSteps: 3, items,
        placeholder: `Select a "call unit" that'll launch new callback`,
        activeItem: items.find(item => item.label === state.callNode?.label),
        onHighlight: async (items) => await w.cursorJump(state.editor!,
            items[0].node.startPosition.row,
            items[0].node.startPosition.column,
            items[0].label.split('(')[0].trim().length,
        ),
    });
    state.callBody = callUnits.filter([tags.call.body!])
        .nodes[items.indexOf(state.callNode)];

    return (input: MultiStepInput) => pickNode(input, state);
}

async function pickNode(input: MultiStepInput, state: Partial<EventState>) {
    const language = state.parser!.language;

    function filterBody(items: QueryItems, tag: Block) {
        return state.parser!.captures(
            items.str, state.callBody,
        ).filter([tag.item]).nodes;
    }
    const jumps = filterBody(language.jump, tags.jump);
    const loops = filterBody(language.loop, tags.loop);
    const flows = filterBody(language.flow, tags.flow);

    const jumpItems: QuickPickNode[] = jumps.map(node => ({
        node, description: 'Jump', type: 'jump',
        label: node.text.split(';')[0].trim(),
    }));
    const loopItems: QuickPickNode[] = loops.map(node => {
        const textBody = state.editor!.document.lineAt(new vs.Position(
            node.startPosition.row + 1, 0)).text;
        return {
            node, detail: 'Loop', type: 'loop',
            description: textBody.trim(),
            label: node.text.split('{')[0].trim(),
        };
    });
    const flowItems: QuickPickNode[] = flows.map(node => {
        const text = state.editor!.document.lineAt(new vs.Position(
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
        node: state.callBody!,
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
                    state.editor!, line, offset,
                    item.label.length,
                );
                break;
            case 'body':
            case 'flow':
                const character = state.editor!.document.lineAt(
                    new vs.Position(line, offset),
                ).firstNonWhitespaceCharacterIndex;

                await w.cursorJump(state.editor!, line, character, offset);
                break;
        }
    };
    // Interaction with a user itself
    state.bodyNode = await input.showQuickPick<QuickPickNode>({
        title: state.title, step: 2, totalSteps: 3, items, onHighlight,
        activeItem: items.find(item => item.label === state.bodyNode?.label),
        placeholder: `Select a place where new callback will be launched`,
    });

    const nodes = ({
        'jump': jumps, 'loop': loops, 'flow': flows,
        'body': bodyItems,
    })[state.bodyNode.type!];
    state.eventName = state.callNode!.label.split('(')[0] + '_'
        + state.bodyNode!.label.split(' ')[0].split('(')[0] + '_'
        + (1 + nodes!.findIndex(item => state.bodyNode!.node === item));

    return (input: MultiStepInput) => nameCallback(input, state);
}

async function nameCallback(input: MultiStepInput, state: Partial<EventState>) {
    const inputName = await input.showInputBox({
        title: state.title, step: 3, totalSteps: 3,
        value: state.eventName!,
        prompt: 'Set a name for the new callback',
    });
    const point = state.callNode!.node.startPosition;
    const position = new vs.Position(point.row, point.column);
    state.editor!.selection = new vs.Selection(position, position);

    const amount = (await executeFeatureProvider(
        state.editor!, cmd.name(cmd.vsCommand.references)
    )).length;
    const callName = state.callNode!.label.split('(')[0];
    const detail = [
        `Do you really want to place callback in chosen call unit (${callName})?`,
        amount > 0 ? `It's used by your code in exactly ${amount} places!` : '',
    ].filter(i => i !== '').join('\n');
    const confirmOption = 'Yes';

    const choice = await vs.window.showInformationMessage(
        state.title!, { detail, modal: true }, confirmOption);
    if (choice !== confirmOption) { return; }

    let line = state.bodyNode!.node.startPosition.row;
    if (state.bodyNode!.type !== 'jump') { line++; }
    placeCallback(state.editor!, line, inputName);
    vs.commands.executeCommand('editor.action.addCommentLine');
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
