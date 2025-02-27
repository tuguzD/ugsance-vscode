import { Language } from ".";
import { QueryItem } from "../queries";
import { tag } from "../queries/function";

export const JavaScript: Language = {
    vscodeId: 'javascript',
    function: [
        jsQueryItem('arrow_function', false),
        jsQueryItem('generator_function', false),
        jsQueryItem('function_expression', false),
        jsQueryItem('method_definition', true, true),
        jsQueryItem('function_declaration', true, false),
        jsQueryItem('generator_function_declaration', true, false),
    ],
};
export const TypeScript: Language = {
    vscodeId: 'typescript',
    function: [
        jsQueryItem('arrow_function', false),
        jsQueryItem('generator_function', false),
        jsQueryItem('function_expression', false),
        jsQueryItem('method_definition', true, true),
        jsQueryItem('function_declaration', true, false),
        jsQueryItem('generator_function_declaration', true, false),
    ],
};

function jsQueryItem(funName: string, named: boolean, method: boolean = false) {
    let identifier = (method ? 'property_' : '') + 'identifier';
    let children: QueryItem[] = named ? [
        new QueryItem(tag.name, identifier),
    ] : [];

    children.push(
        new QueryItem(tag.args, 'formal_parameters'),
        new QueryItem(tag.body, 'statement_block'),
    );
    return new QueryItem(tag.fun, funName, children);
}
