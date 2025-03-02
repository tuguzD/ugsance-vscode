import { Language } from "../model";
import { queryItems } from "../../queries";
import { Alternation, QueryItem } from "../../queries/model";
import { tags } from "../../queries/tag";
import * as unit from "../../queries/items/call-unit";
import * as loop from "../../queries/items/loop";

const callUnits = [
    unit.queryItem({
        unit: 'method_declaration', name: 'identifier',
        body: 'block', args: 'formal_parameters',
    }),
    unit.queryItem({
        unit: 'constructor_declaration', name: 'identifier',
        body: 'constructor_body', args: 'formal_parameters',
    }),
    unit.queryItem({
        unit: 'synchronized_statement', name: null,
        body: 'block', args: 'parenthesized_expression',
    }),
    new QueryItem(tags.unit.unit, 'lambda_expression', [
        new Alternation(null, [
            new QueryItem(tags.unit.args, 'formal_parameters'),
            new QueryItem(tags.unit.args, 'inferred_parameters'),
        ]),
        new QueryItem(tags.unit.body, 'block'),
    ]),
];
const jumps = queryItems(tags.jump, [
    'return_statement',
    'break_statement', 'continue_statement',
    'yield_statement', 'throw_statement',
]);
const loops = loop.queryItems('statement', [
    'do_statement', 'while_statement',
    'for_statement', 'enhanced_for_statement',
]);
const flows: QueryItem[] = [
    // todo
/*

( if_statement [
( statement ) @body
( statement )* @body
] ) @flow

( switch_expression
( switch_block
( switch_block_statement_group ) @body )
) @flow

( try_statement [
( block ) @body
( catch_clause
( block ) @body ) @flow
( finally_clause
( block ) @body ) @flow
] ) @flow

( try_with_resources_statement [
( block ) @body
( catch_clause
( block ) @body ) @flow
( finally_clause
( block ) @body ) @flow
] ) @flow

*/
];

export const Java: Language = {
    vscodeId: 'java',
    jump: jumps,
    loop: loops,
    flow: flows,
    callUnit: callUnits,
};
