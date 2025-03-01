import { Language } from ".";
import { Alternation, QueryItem } from "../queries";
import { tag } from "../queries/function";

export const C: Language = {
    vscodeId: 'c',
    callUnit: [
        cQueryItem(['identifier']),
    ],
};
export const Cpp: Language = {
    vscodeId: 'cpp',
    callUnit: [
        cQueryItem([
            'identifier', 'field_identifier',
            'qualified_identifier', 'operator_name',
            'destructor_name', 'structured_binding_declarator',
        ]),
        new QueryItem(tag.call, 'lambda_expression', [
            new QueryItem(tag.name, 'lambda_capture_specifier'),
            new QueryItem(null, 'abstract_function_declarator', [
                new QueryItem(tag.args, 'parameter_list'),
            ], true),
            new QueryItem(tag.body, 'compound_statement'),
        ]),
    ],
};

function cQueryItem(nameTypes: string[]) {
    let nameItem = new Alternation(null, nameTypes.map(
        type => new QueryItem(tag.name, type),
    ), true);

    return new QueryItem(
        tag.call, 'function_definition', [
        new QueryItem(null, 'function_declarator', [
            nameItem,
            new QueryItem(tag.args, 'parameter_list'),
        ]),
        new QueryItem(tag.body, 'compound_statement'),
    ]);
}
