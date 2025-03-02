import { Language } from "../model";
import { tags } from "../../queries/tag";
import * as block from "../../queries/items/block";
import * as flow from "../../queries/items/flow";
import * as unit from "../../queries/items/call-unit";

const callUnits = [
    jsQueryItem('arrow_function', false),
    jsQueryItem('generator_function', false),
    jsQueryItem('function_expression', false),
    jsQueryItem('method_definition', true, true),
    jsQueryItem('function_declaration', true, false),
    jsQueryItem('generator_function_declaration', true, false),
];
const jumps = block.items(tags.jump, [
    'return_statement', 'throw_statement',
    'break_statement', 'continue_statement',
    'yield_expression', 'await_expression',
]);
/*
( if_statement
( statement ) @body
( else_clause
( statement ) @body )*
) @flow

( switch_statement
( switch_body [
( switch_case ) @body
( switch_default ) @body
] ) ) @flow
*/
const flows = [
    ...flow.items(tags.flow, ['try_statement'],
        ['catch_clause', 'finally_clause'],
    'statement_block'),
];
const loops = block.items(tags.loop, [
    'do_statement', 'while_statement',
    'for_statement', 'for_in_statement',
], 'statement');

export const JavaScript: Language = {
    vscodeId: 'javascript',
    jump: jumps,
    loop: loops, flow: flows,
    callUnit: callUnits,
};
export const TypeScript: Language = {
    vscodeId: 'typescript',
    jump: jumps,
    loop: loops, flow: flows,
    callUnit: callUnits,
};

function jsQueryItem(callUnit: string, named: boolean, method: boolean = false) {
    let identifier = (method ? 'property_' : '') + 'identifier';

    return unit.queryItem({
        item: callUnit, name: named ? identifier : null,
        body: 'statement_block', args: 'formal_parameters',
    });
}
