import { Language } from ".";
import { queryItems } from "../queries";
import { tags } from "../queries/tag";
import * as unit from "../queries/call-unit";
import * as loop from "../queries/loop";

const jumps = queryItems(tags.jump, [
    'return_statement', 'throw_statement',
    'break_statement', 'continue_statement',
    'yield_expression', 'await_expression',
]);
const loops = loop.queryItems('statement', [
    'do_statement', 'while_statement',
    'for_statement', 'for_in_statement',
]);
const callUnits = [
    jsQueryItem('arrow_function', false),
    jsQueryItem('generator_function', false),
    jsQueryItem('function_expression', false),
    jsQueryItem('method_definition', true, true),
    jsQueryItem('function_declaration', true, false),
    jsQueryItem('generator_function_declaration', true, false),
];

export const JavaScript: Language = {
    vscodeId: 'javascript',
    jump: jumps,
    loop: loops,
    callUnit: callUnits,
};
export const TypeScript: Language = {
    vscodeId: 'typescript',
    jump: jumps,
    loop: loops,
    callUnit: callUnits,
};

function jsQueryItem(callUnit: string, named: boolean, method: boolean = false) {
    let identifier = (method ? 'property_' : '') + 'identifier';

    return unit.queryItem({
        unit: callUnit, name: named ? identifier : null,
        body: 'statement_block', args: 'formal_parameters',
    });
}
