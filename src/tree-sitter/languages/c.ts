import { Language } from ".";
import { Alternation, QueryItem, queryItems } from "../queries";
import { tags } from "../queries/tag";

const jump = queryItems(tags.jump, [
    'return_statement', 'goto_statement',
    'break_statement', 'continue_statement',
]);

export const C: Language = {
    vscodeId: 'c',
    callUnit: [cQueryItem(['identifier'])],
    jump: jump,
};
export const Cpp: Language = {
    vscodeId: 'cpp',
    jump: jump.concat(queryItems(tags.jump, [
        'throw_statement', // then: coroutines (C++20)
        'co_return_statement', 'co_yield_statement', 'co_await_expression',
    ])),
    callUnit: [
        cQueryItem([
            'identifier', 'field_identifier',
            'qualified_identifier', 'operator_name',
            'destructor_name', 'structured_binding_declarator',
        ]),
        new QueryItem(tags.unit.unit, 'lambda_expression', [
            new QueryItem(tags.unit.name, 'lambda_capture_specifier'),
            new QueryItem(null, 'abstract_function_declarator', [
                new QueryItem(tags.unit.args, 'parameter_list'),
            ], true),
            new QueryItem(tags.unit.body, 'compound_statement'),
        ]),
    ],
};

function cQueryItem(nameTypes: string[]) {
    return new QueryItem(
        tags.unit.unit, 'function_definition', [
        new QueryItem(null, 'function_declarator', [
            new Alternation(null, 
                queryItems(tags.unit.name!, nameTypes), true),
            new QueryItem(tags.unit.args, 'parameter_list'),
        ]),
        new QueryItem(tags.unit.body, 'compound_statement'),
    ]);
}
