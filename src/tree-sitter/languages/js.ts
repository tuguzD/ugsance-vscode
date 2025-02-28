import { Language } from ".";
import { queryItem } from "../queries/function";

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
    callUnit: callUnit,
};
export const TypeScript: Language = {
    vscodeId: 'typescript',
    callUnit: callUnit,
};

function jsQueryItem(callUnit: string, named: boolean, method: boolean = false) {
    let identifier = (method ? 'property_' : '') + 'identifier';

    return queryItem({
        call: callUnit, name: named ? identifier : null,
        body: 'statement_block', args: 'formal_parameters',
    });
}
