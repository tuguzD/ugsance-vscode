import { Language } from "../model";
import { QueryItem } from "../../queries/model";
import { tags } from "../../queries";
import * as block from "../../queries/items/block";
import * as flow from "../../queries/items/flow";
import * as call from "../../queries/items/call";
import { items } from ".";

const calls = [
    call.item({
        item: 'function_item', body: 'block',
        name: 'identifier', args: 'parameters',
    }),
    new QueryItem({
        tag: tags.call.item, type: 'macro_definition',
        children: [
            new QueryItem({ tag: tags.call.name, type: 'identifier' }),
            new QueryItem({ type: 'macro_rule', children: [
                new QueryItem({ tag: tags.call.args, type: 'token_tree_pattern' }),
                new QueryItem({ tag: tags.call.body, type: 'token_tree' }),
            ]}),
        ],
    }),
    call.item({
        item: 'closure_expression', body: 'block',
        name: null, args: 'closure_parameters',
    }),
    new QueryItem({ children: [
        new QueryItem({ 
            tag: tags.call.body, type: 'block', children: [
            new QueryItem({ type: 'label', children: [
                new QueryItem({ tag: tags.call.name, type: 'identifier' }),
            ], option: true }),
        ]}),
    ]}),
];
const jumps = block.items(tags.jump, [
    'return_expression',
    'yield_expression', 'await_expression',
    'break_expression', 'continue_expression',
]);
const flows = [
    ...flow.items(tags.flow,
        ['if_expression'], ['else_clause'],
    'block'),
    ...flow.items(tags.flow,
        ['match_expression'], ['match_block'],
    'match_arm', false, false, false),
];
// TODO: TRY is a loop? What???
const loops = block.items(tags.loop, [
    'for_expression', 'loop_expression',
    'while_expression', 'try_block',
], 'block');

export const Rust: Language = {
    vscodeId: 'rust',
    type: items([]), type_data: items([]),
    call: items(calls), call_data: items([]),
    jump: items(jumps), loop: items(loops), flow: items(flows),
};
