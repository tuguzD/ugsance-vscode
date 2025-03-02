import { Language } from ".";
import { queryItems } from "../queries";
import { queryItem } from "../queries/call-unit";
import { tags } from "../queries/tag";

const jump = queryItems(tags.jump, [
    'return_statement', 'throw_statement',
    'break_statement', 'continue_statement',
]);
const callUnit = [
    jsQueryItem('arrow_function', false),
    jsQueryItem('generator_function', false),
    jsQueryItem('function_expression', false),
    jsQueryItem('method_definition', true, true),
    jsQueryItem('function_declaration', true, false),
    jsQueryItem('generator_function_declaration', true, false),
];

export const JavaScript: Language = {
    vscodeId: 'javascript',
    jump: jump,
    callUnit: callUnit,
};
export const TypeScript: Language = {
    vscodeId: 'typescript',
    jump: jump,
    callUnit: callUnit,
};

function jsQueryItem(callUnit: string, named: boolean, method: boolean = false) {
    let identifier = (method ? 'property_' : '') + 'identifier';

    return queryItem({
        unit: callUnit, name: named ? identifier : null,
        body: 'statement_block', args: 'formal_parameters',
    });
}
