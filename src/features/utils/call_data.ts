import * as T from 'web-tree-sitter';
import * as M from '../model';

import * as util from '../../utils';

import { tags } from '../../tree-sitter/queries';

import * as w from '../../vscode/inputs';
import { MultiStepInput } from '../../vscode/inputs/model';

export interface State extends M.State {
    argItem: M.QuickPickNode,
    argName: T.SyntaxNode, argType: T.SyntaxNode,
}

export async function pick(
    input: MultiStepInput, state: Partial<State>,
    node: T.SyntaxNode, placeholder: string,
) {
    const captures = state.parser!.captures(
        state.parser!.language.call_data.str, node);
    const names = captures.filter([tags.data.name]),
        types = captures.filter([tags.data.type]);

    const items: M.QuickPickNode[] = names.nodesText.map(
        (value, index) => ({
            node: types.nodes[index],
            label: util.clean(value),
            description: types.nodesText[index],
        }),
    );
    if (!items.length) {
        if (input.currentStep() === state.step! + 1) {
            input.popStep();
        }
        return;
    }
    state.argItem = await input.showQuickPick<M.QuickPickNode>({
        title: state.title, placeholder,
        step: state.step, totalSteps: state.totalSteps,
        items, activeItem: items.find(
            item => item.label === state.argItem?.label),
        onHighlight: async (items) => await w.cursorJump(state.editor!,
            items[0].node.startPosition.row,
            items[0].node.startPosition.column,
            (items[0].label + items[0].description).length + 1,
        ),
    });

    const index = items.indexOf(state.argItem);
    state.argName = names.nodes[index];
    state.argType = types.nodes[index];
}
