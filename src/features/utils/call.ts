import * as T from 'web-tree-sitter';
import * as M from '../model';

import * as util from '../../utils';

import { tags } from '../../tree-sitter/queries';

import * as w from '../../vscode/inputs';
import { MultiStepInput } from '../../vscode/inputs/model';

export interface State extends M.State {
    callItem: M.QuickPickNode, callName: T.SyntaxNode,
    callArgs: T.SyntaxNode, callBody: T.SyntaxNode,
}

export async function pick(
    input: MultiStepInput, state: Partial<State>,
    placeholder: string,
) {
    const captures = state.parser!.captures(
        state.parser!.language.call.str);
    // console.log(parser.language.call.str);
    const names = captures.filter([tags.call.name!]),
        bodies = captures.filter([tags.call.body!]),
        args = captures.filter([tags.call.args]);
    // console.log(
    //     bodies.list.length + " bodies, "
    //     + names.list.length + " names!"
    // );

    // TODO: fix different lengths of 'name' and 'args' arrays
    // IDK how, because 'name' doesn't exist for lambdas and sync. statements (for Java)
    const items: M.QuickPickNode[] = names.nodesText.map(
        (value, index) => ({
            node: names.nodes[index],
            label: util.clean(value),
            description: args.nodesText[index].slice(1, -1),
        }),
    );
    state.callItem = await input.showQuickPick<M.QuickPickNode>({
        title: state.title, placeholder,
        step: state.step, totalSteps: state.totalSteps,
        items, activeItem: items.find(
            item => item.label === state.callItem?.label),
        onHighlight: async (items) => await w.cursorJump(state.editor!,
            items[0].node.startPosition.row,
            items[0].node.startPosition.column,
            items[0].label.split('(')[0].trim().length,
        ),
    });

    const index = items.indexOf(state.callItem);
    state.callArgs = args.nodes[index];
    state.callName = names.nodes[index];
    state.callBody = bodies.nodes[index];

    // console.log(result.body.parent!
    //     .equals(result.item.node.parent!));
}
