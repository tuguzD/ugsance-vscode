import { Language } from "../model";
import { queryItems } from "../../queries";
import { Alternation, QueryItem } from "../../queries/model";
import { tags } from "../../queries/tag";
import * as unit from "../../queries/items/call-unit";
import * as loop from "../../queries/items/loop";

const callUnits = [
    unit.queryItem({
        unit: 'method_declaration', name: 'identifier',
        body: 'block', args: 'parameter_list',
    }),
    unit.queryItem({
        unit: 'local_function_statement', name: 'identifier',
        body: 'block', args: 'parameter_list',
    }),
    unit.queryItem({
        unit: 'anonymous_method_expression', name: null,
        body: 'block', args: 'parameter_list',
    }),
    new QueryItem(tags.unit.unit, 'constructor_declaration', [
        new QueryItem(tags.unit.name, 'identifier'),
        new QueryItem(tags.unit.args, 'parameter_list'),
        new Alternation(null, [
            new QueryItem(tags.unit.body, 'block'),
            new QueryItem(tags.unit.body, 'arrow_expression_clause'),
        ], false),
    ]),
    new QueryItem(tags.unit.unit, 'property_declaration', [
        new QueryItem(tags.unit.name, 'identifier'),
        new QueryItem(null, 'accessor_list', [
            new QueryItem(null, 'accessor_declaration', [
                new Alternation(null, [
                    new QueryItem(tags.unit.body, 'block'),
                    new QueryItem(tags.unit.body, 'arrow_expression_clause'),
                ], true),
            ]),
        ]),
    ]),
];
const jumps = queryItems(tags.jump, [
    'return_statement',
    'goto_statement', 'yield_statement',
    'break_statement', 'continue_statement',
    'throw_statement', 'throw_expression',
]);
const loops = loop.queryItems('statement', [
    'do_statement', 'while_statement',
    'for_statement', 'foreach_statement',
]);
const flows: QueryItem[] = [
    // todo
/*

( if_statement
( statement ) @body
) @flow

( switch_statement
( switch_body 
( switch_section ) @body )
) @flow

( try_statement
[ ( block ) @body
( catch_clause 
( block ) @body )
( finally_clause 
( block ) @body ) ]
) @flow

( lock_statement
( statement ) @body
) @flow

*/
];

export const CSharp: Language = {
    vscodeId: 'csharp',
    jump: jumps,
    loop: loops,
    flow: flows,
    callUnit: callUnits,
};
