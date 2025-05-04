import * as vs from 'vscode';
import * as T from 'web-tree-sitter';
import * as M from '../model';

import * as util from '../../utils';

import { Configuration } from '../../vscode/commands/model';
import * as cmd from '../../vscode/commands';
import { Parser } from '../../tree-sitter/parsers/model';

import { tags } from '../../tree-sitter/queries';

import { MultiStepInput } from '../../vscode/inputs/model';

import { executeFeatureProvider, checkEditor } from '..';

interface DataState extends M.State {
    typeItem: M.QuickPickNode,
    typeName: T.SyntaxNode, typeBody: T.SyntaxNode,
    dataItem: M.QuickPickNode,
}

export async function launch(parser: Parser, config: Configuration) {
    const editor = await checkEditor(parser, config);
    if (!editor) { return; }

    let state: Partial<DataState> = {
        step: 0, totalSteps: 2,
        title: "New mod data, or existing type's info",
        editor, parser,
    };
    // console.log(parser.language.type.str);
    await MultiStepInput.run(input => pickType(input, state));
}

async function pickType(input: MultiStepInput, state: Partial<DataState>) {
    const captures = state.parser!.captures(
        state.parser!.language.type.str);
    const names = captures.filter([tags.type.name!]),
        bodies = captures.filter([tags.type.body!]);
    
    const items: M.QuickPickNode[] = names.nodesText.map(
        (value, index) => ({
            node: names.nodes[index],
            label: util.clean(value),
            description: util.clean(bodies.nodesText[index]),
        }),
    );

    state.step = 1;
    state.typeItem = await input.showQuickPick<M.QuickPickNode>({
        step: state.step, totalSteps: state.totalSteps,
        title: state.title, 
        items, activeItem: items.find(
            item => item.label === state.typeItem?.label),
        placeholder: `Select a type (struct/class), whose data will be provided to mods`,
    });

    const index = items.indexOf(state.typeItem);
    state.typeName = names.nodes[index];
    state.typeBody = bodies.nodes[index];

    return (input: MultiStepInput) => pickData(input, state);
}

async function pickData(input: MultiStepInput, state: Partial<DataState>) {
    const captures = state.parser!.captures(
        state.parser!.language.type_data.str, state.typeBody!);
    const names = captures.filter([tags.data.name!]),
        types = captures.filter([tags.data.type!]);

    const items: M.QuickPickNode[] = names.nodesText.map(
        (value, index) => ({
            node: names.nodes[index],
            label: util.clean(value),
            description: util.clean(types.nodesText[index]),
        }),
    );

    state.step = 2;
    state.dataItem = await input.showQuickPick<M.QuickPickNode>({
        step: state.step, totalSteps: state.totalSteps,
        title: state.title,
        items, activeItem: items.find(
            item => item.label === state.dataItem?.label),
        placeholder: `Select data of type (field), that'll be provided to mods`,
    });
    confirm(state);
}

// TODO: setup cursor position (to use LSP)
// just like it's done in "event"
async function confirm(state: Partial<DataState>) {
    const amount = (await executeFeatureProvider(
        state.editor!, cmd.name(cmd.vsCommand.references)
    )).length;
    const typeName = state.typeItem!.label.split('(')[0];
    const detail = [
        `Do you really want to provide chosen type's data (${typeName}) for mods?`,
        (amount > 0 ? `It's used by your code in exactly ${amount} places!` : '')
    ].filter(i => i !== '').join('\n');
    const confirmOption = 'Yes';

    const choice = await vs.window.showInformationMessage(
        state.title!, { detail, modal: true }, confirmOption);
    if (choice !== confirmOption) { return; }

    vs.window.showInformationMessage(
        "Type's data for mods (existing type's info) is generated!");
}
