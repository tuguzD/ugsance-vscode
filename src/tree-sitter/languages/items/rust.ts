import { Language } from "../model";
import { QueryItem } from "../../queries/model";
import { tags } from "../../queries";
import * as block from "../../queries/items/block";
import * as flow from "../../queries/items/flow";
import * as unit from "../../queries/items/call-unit";
import { items } from ".";

const callUnits = [
    unit.item({
        item: 'function_item', body: 'block',
        name: 'identifier', args: 'parameters',
    }),
    new QueryItem({
        tag: tags.unit.item, type: 'macro_definition',
        children: [
            new QueryItem({ tag: tags.unit.name, type: 'identifier' }),
            new QueryItem({ type: 'macro_rule', children: [
                new QueryItem({ tag: tags.unit.args, type: 'token_tree_pattern' }),
                new QueryItem({ tag: tags.unit.body, type: 'token_tree' }),
            ]}),
        ],
    }),
    unit.item({
        item: 'closure_expression', body: 'block',
        name: null, args: 'closure_parameters',
    }),
    new QueryItem({ children: [
        new QueryItem({ 
            tag: tags.unit.body, type: 'block', children: [
            new QueryItem({ type: 'label', children: [
                new QueryItem({ tag: tags.unit.name, type: 'identifier' }),
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
    jump: items(jumps),
    loop: items(loops), flow: items(flows),
    callUnit: items(callUnits),
};
