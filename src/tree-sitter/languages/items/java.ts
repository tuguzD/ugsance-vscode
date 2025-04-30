import { Language } from "../model";
import { Alternation, QueryItem } from "../../queries/model";
import { tags } from "../../queries";
import * as block from "../../queries/items/block";
import * as flow from "../../queries/items/flow";
import * as unit from "../../queries/items/call-unit";
import { items } from ".";

const callUnits = [
    unit.item({
        item: 'method_declaration', name: 'identifier',
        body: 'block', args: 'formal_parameters',
    }),
    unit.item({
        item: 'constructor_declaration', name: 'identifier',
        body: 'constructor_body', args: 'formal_parameters',
    }),
    new QueryItem(tags.unit.item, 'compact_constructor_declaration', [
        new QueryItem(tags.unit.name, 'identifier'),
        new QueryItem(tags.unit.body, 'block'),
    ]),
    unit.item({
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
const flows: QueryItem[] = [
    new QueryItem(tags.flow.item, 'if_statement', [
        new QueryItem(tags.flow.body, 'block'),
    ]),
    // new QueryItem(tags.flow.item, 'if_statement', [new Alternation(null, [
    //     new QueryItem(tags.flow.body, 'statement'),
    //     new QueryItem(tags.flow.body, 'statement', [], false, true),
    // ])]),
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
    jump: items(jumps),
    loop: items(loops), flow: items(flows),
    callUnit: items(callUnits),
};
