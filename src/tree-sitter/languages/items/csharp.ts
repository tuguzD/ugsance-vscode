import { Language } from "../model";
import { Alternation, QueryItem } from "../../queries/model";
import { tags } from "../../queries/tag";
import * as block from "../../queries/items/block";
import * as flow from "../../queries/items/flow";
import * as unit from "../../queries/items/call-unit";

const callUnits = csQueryItems([
    'method_declaration', 'local_function_statement',
    'anonymous_method_expression', // no "name" tag
]).concat([
    new QueryItem(tags.unit.item, 'constructor_declaration', [
        new QueryItem(tags.unit.name, 'identifier'),
        new QueryItem(tags.unit.args, 'parameter_list'),
        arrowBody(false),
    ]),
    new QueryItem(tags.unit.item, 'property_declaration', [
        new QueryItem(tags.unit.name, 'identifier'),
        new QueryItem(null, 'accessor_list', [
            new QueryItem(null, 'accessor_declaration', [arrowBody()]),
        ]),
    ]),
]);
const jumps = block.items(tags.jump, [
    'return_statement',
    'goto_statement', 'yield_statement',
    'break_statement', 'continue_statement',
    'throw_statement', 'throw_expression',
]);
const loops = block.items(tags.loop, [
    'do_statement', 'while_statement',
    'for_statement', 'foreach_statement',
], 'statement');
/*
( if_statement
( statement ) @body
) @flow

( switch_statement
( switch_body 
( switch_section ) @body )
) @flow

( lock_statement
( statement ) @body
) @flow
*/
const flows: QueryItem[] = [
    ...flow.items(tags.flow, ['try_statement'],
        ['catch_clause', 'finally_clause'],
    'block'),
];

export const CSharp: Language = {
    vscodeId: 'csharp',
    jump: jumps,
    loop: loops, flow: flows,
    callUnit: callUnits,
};

function csQueryItems(units: string[]): QueryItem[] {
    return units.map(item => unit.queryItem({
        item: item, body: 'block', args: 'parameter_list',
        name: item.includes('anonymous') ? null : 'identifier',
    }));
}

function arrowBody(optional = true): QueryItem {
    return new Alternation(null, [
        new QueryItem(tags.unit.body, 'block'),
        new QueryItem(tags.unit.body, 'arrow_expression_clause'),
    ], optional);
}
