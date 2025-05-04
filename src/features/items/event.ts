
import * as vs from 'vscode';

import { Configuration } from '../../vscode/commands/model';
import * as cmd from '../../vscode/commands';
import { Parser } from '../../tree-sitter/parsers/model';

import { tags } from '../../tree-sitter/queries';

import * as w from '../../vscode/inputs';
import { MultiStepInput } from '../../vscode/inputs/model';

import { executeFeatureProvider, checkEditor } from '..';
import { QuickPickNode } from '../model';
import { QueryItems } from '../../tree-sitter/queries/model';
import { Block } from '../../tree-sitter/queries/items/block';

import * as call from '../utils/call';
import * as data from '../utils/call_data';

interface EventState extends call.State, data.State {
    chosenBody: QuickPickNode,
    resultName: string,
}

export async function launch(parser: Parser, config: Configuration) {
    const editor = await checkEditor(parser, config);
    if (!editor) { return; }

    let state: Partial<EventState> = {
        step: 0, totalSteps: 4,
        title: 'New callback, or mod event',
        editor, parser,
    };
    await MultiStepInput.run(input => pickCall(input, state));
}

async function pickCall(input: MultiStepInput, state: Partial<EventState>) {
    state.step = 1;
    await call.pick(input, state,
        `Select a "call unit" that'll launch new callback`,
    );
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

                await w.cursorJump(state.editor!, line, character, item.label.length);
                break;
        }
    };
    // Interaction with a user itself
    state.step = 2;
    state.chosenBody = await input.showQuickPick<QuickPickNode>({
        step: state.step, totalSteps: state.totalSteps,
        title: state.title, items, onHighlight,
        activeItem: items.find(item => item.label === state.chosenBody?.label),
        placeholder: `Select a place where new callback will be launched`,
    });

    const nodes = ({
        'jump': jumps, 'loop': loops, 'flow': flows,
        'body': bodyItems,
    })[state.chosenBody.type!];
    state.resultName = state.callItem!.label.split('(')[0] + '_'
        + state.chosenBody!.label.split(' ')[0].split('(')[0] + '_'
        + (1 + nodes!.findIndex(item => state.chosenBody!.node === item));

    return (input: MultiStepInput) => pickData(input, state);
}

async function pickData(input: MultiStepInput, state: Partial<EventState>) {
    state.step = 3;
    await data.pick(input, state, state.callArgs!,
        `Select a "call unit" that'll launch new callback`,
    );
    return (input: MultiStepInput) => nameCallback(input, state);
}

async function nameCallback(input: MultiStepInput, state: Partial<EventState>) {
    state.step = 4;
    state.resultName = await input.showInputBox({
        step: state.step, totalSteps: state.totalSteps,
        title: state.title, value: state.resultName!,
        prompt: 'Set a name for the new callback',
    });
    confirm(state);
}

async function confirm(state: Partial<EventState>) {
    const point = state.callItem!.node.startPosition;
    const position = new vs.Position(point.row, point.column);
    state.editor!.selection = new vs.Selection(position, position);

    const amount = (await executeFeatureProvider(
        state.editor!, cmd.name(cmd.vsCommand.references)
    )).length;
    const callName = state.callItem!.label.split('(')[0];
    const detail = [
        `Do you really want to place callback in chosen call unit (${callName})?`,
        (amount > 0 ? `It's used by your code in exactly ${amount} places!` : ''),
    ].filter(i => i !== '').join('\n');
    const confirmOption = 'Yes';

    const choice = await vs.window.showInformationMessage(
        state.title!, { detail, modal: true }, confirmOption);
    if (choice !== confirmOption) { return; }

    let line = state.chosenBody!.node.startPosition.row;
    if (state.chosenBody!.type !== 'jump') { line++; }

    const args = ['this'];
    if (state.argItem) {
        args.push(state.argItem.label);
    }
    const typeName = state.parser!.captures(
        state.parser!.language.type.str,
        state.callItem!.node.parent!.parent!.parent!,
    ).filter([tags.type.name]).nodesText[0];

    placeCallback(state.editor!, line,
        state.resultName!, args.join(', '), typeName + '_PubFun',
    );
    vs.window.showInformationMessage(
        'Callback (mod event) is generated!');
    vs.commands.executeCommand('editor.action.addCommentLine');
}

function placeCallback(
    editor: vs.TextEditor, line: number,
    name: string, args: string, type?: string,
) {
    const character = editor!.document.lineAt(
        new vs.Position(line, 0),
    ).firstNonWhitespaceCharacterIndex;

    const space = editor!.document.getText(new vs.Range(
        new vs.Position(line, 0),
        new vs.Position(line, character),
    ));
    const result = space +
        (type ? `${type}.` : '') +
        `${name}(${args})` + ';\n';

    editor!.edit(i => i.insert(
        new vs.Position(line, 0), result,
    ));
    editor!.selection = new vs.Selection(
        new vs.Position(line, character),
        new vs.Position(line, result.length),
    );
}
