import { Language } from "../model";
import { Alternation, QueryItem } from "../../queries/model";
import { tags } from "../../queries/tag";
import * as block from "../../queries/items/block";
import * as flow from "../../queries/items/flow";
import * as unit from "../../queries/items/call-unit";

const callUnits = [
    unit.queryItem({
        item: 'method_declaration', name: 'identifier',
        body: 'block', args: 'formal_parameters',
    }),
    unit.queryItem({
        item: 'constructor_declaration', name: 'identifier',
        body: 'constructor_body', args: 'formal_parameters',
    }),
    unit.queryItem({
        item: 'synchronized_statement', name: null,
        body: 'block', args: 'parenthesized_expression',
    }),
    new QueryItem(tags.unit.item, 'lambda_expression', [
        new Alternation(null, [
            new QueryItem(tags.unit.args, 'formal_parameters'),
            new QueryItem(tags.unit.args, 'inferred_parameters'),
        ]),
        new QueryItem(tags.unit.body, 'block'),
    ]),
];
const jumps = block.items(tags.jump, [
    'return_statement',
    'break_statement', 'continue_statement',
    'yield_statement', 'throw_statement',
]);
/*
( if_statement [
( statement ) @body
( statement )* @body
] ) @flow
*/
const flows: QueryItem[] = [
    ...flow.items(tags.flow, ['switch_expression'],
        ['switch_block'], 'switch_block_statement_group',
    false, false, false),
    ...flow.items(tags.flow,
        ['try_statement', 'try_with_resources_statement'],
        ['catch_clause', 'finally_clause'],
    'block'),
];
const loops = block.items(tags.loop, [
    'do_statement', 'while_statement',
    'for_statement', 'enhanced_for_statement',
], 'statement');

export const Java: Language = {
    vscodeId: 'java',
    jump: jumps,
    loop: loops, flow: flows,
    callUnit: callUnits,
};
