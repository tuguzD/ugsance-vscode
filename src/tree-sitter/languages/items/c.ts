import { Language } from "../model";
import { Alternation, QueryItem } from "../../queries/model";
import { tags } from "../../queries/tag";
import * as flow from "../../queries/items/flow";
import * as block from "../../queries/items/block";

const callUnitsCpp = [
    cQueryItem([
        'identifier', 'field_identifier',
        'qualified_identifier', 'operator_name',
        'destructor_name', 'structured_binding_declarator',
    ]),
    new QueryItem(tags.unit.item, 'lambda_expression', [
        new QueryItem(tags.unit.name, 'lambda_capture_specifier'),
        new QueryItem(null, 'abstract_function_declarator', [
            new QueryItem(tags.unit.args, 'parameter_list'),
        ], true),
        new QueryItem(tags.unit.body, 'compound_statement'),
    ]),
];
const jumps = block.items(tags.jump, [
    'return_statement', 'goto_statement',
    'break_statement', 'continue_statement',
]);
const loops = block.items(tags.loop, [
    'for_statement', 'do_statement', 'while_statement',
], 'compound_statement');
const flows = [
    ...flow.items(tags.flow,
        ['if_statement'], ['else_clause'],
    'compound_statement'),
];
/*
( switch_statement
( compound_statement
( case_statement ) @body )
) @flow

// C++ ONLY
( try_statement 
( compound_statement ) @body
( catch_clause 
( compound_statement ) @body )
) @flow
*/

export const C: Language = {
    vscodeId: 'c',
    loop: loops, flow: flows,
    callUnit: [cQueryItem(['identifier'])],
    jump: jumps,
};
export const Cpp: Language = {
    vscodeId: 'cpp',
    loop: loops, flow: flows,
    callUnit: callUnitsCpp,
    jump: jumps.concat(block.items(tags.jump, [
        'throw_statement', // then: coroutines (C++20)
        'co_return_statement', 'co_yield_statement', 'co_await_expression',
    ])),
};

function cQueryItem(nameTypes: string[]) {
    return new QueryItem(
        tags.unit.item, 'function_definition', [
        new QueryItem(null, 'function_declarator', [
            new Alternation(null, block.items({
                item: tags.unit.name!, body: null,
            }, nameTypes), true),
            new QueryItem(tags.unit.args, 'parameter_list'),
        ]),
        new QueryItem(tags.unit.body, 'compound_statement'),
    ]);
}
