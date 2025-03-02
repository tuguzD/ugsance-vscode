import { Language } from "../model";
import { QueryItem } from "../../queries/model";
import { tags } from "../../queries/tag";
import * as block from "../../queries/items/block";
import * as unit from "../../queries/items/call-unit";

const callUnits = [
    unit.queryItem({
        item: 'function_item', body: 'block',
        name: 'identifier', args: 'parameters',
    }),
    new QueryItem(tags.unit.item, 'macro_definition', [
        new QueryItem(tags.unit.name, 'identifier'),
        new QueryItem(null, 'macro_rule', [
            new QueryItem(tags.unit.args, 'token_tree_pattern'),
            new QueryItem(tags.unit.body, 'token_tree'),
        ]),
    ]),
    unit.queryItem({
        item: 'closure_expression', body: 'block',
        name: null, args: 'closure_parameters',
    }),
    new QueryItem(null, '', [
        new QueryItem(tags.unit.body, 'block', [
            new QueryItem(null, 'label', [
                new QueryItem(tags.unit.name, 'identifier'),
            ], true),
        ]),
    ]),
];
const jumps = block.items(tags.jump, [
    'return_expression',
    'yield_expression', 'await_expression',
    'break_expression', 'continue_expression',
]);
const loops = block.items(tags.loop, [
    'for_expression', 'loop_expression',
    'while_expression', 'try_block',
], 'block');
const flows: QueryItem[] = [
    // todo
/*

( if_expression [ 
( block ) @body
( else_clause
( block ) @body ) @flow
] ) @flow

( match_expression 
( match_block 
( match_arm ) @body )
) @flow

*/
];

export const Rust: Language = {
    vscodeId: 'rust',
    jump: jumps,
    loop: loops, flow: flows,
    callUnit: callUnits,
};
