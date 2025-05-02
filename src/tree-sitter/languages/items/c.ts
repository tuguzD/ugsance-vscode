import { Language } from "../model";
import { Alternation, QueryItem } from "../../queries/model";
import { tags } from "../../queries";
import * as flow from "../../queries/items/flow";
import * as block from "../../queries/items/block";
import { items } from ".";

function callItem(types: string[]) {
    return new QueryItem({
        tag: tags.call.item, type: 'function_definition',
        children: [
            new QueryItem({ type: 'function_declarator', children: [
                new Alternation({ children: block.items({
                    item: tags.call.name!, body: null,
                }, types), option: true }),
                new QueryItem({ tag: tags.call.args, type: 'parameter_list' }),
            ]}),
            new QueryItem({ tag: tags.call.body, type: 'compound_statement' }),
        ],
    });
}

const calls = [
    callItem([
        'identifier', 'field_identifier',
        'qualified_identifier', 'operator_name',
        'destructor_name', 'structured_binding_declarator',
    ]),
    new QueryItem({
        tag: tags.call.item, type: 'lambda_expression',
        children: [
            new QueryItem({ tag: tags.call.name, type: 'lambda_capture_specifier' }),
            new QueryItem({
                type: 'abstract_function_declarator', children: [
                    new QueryItem({ tag: tags.call.args, type: 'parameter_list' }),
                ], option: true
            }),
            new QueryItem({ tag: tags.call.body, type: 'compound_statement' }),
        ],
    }),
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
    ...flow.items(tags.flow,
        ['switch_statement'], ['compound_statement'],
    'case_statement', false, false, false),
];

export const C: Language = {
    vscodeId: 'c',
    type: items([]), type_data: items([]),
    call: items([ callItem(['identifier']) ]), call_data: items([]),
    flow: items(flows), loop: items(loops), jump: items(jumps),
};
export const Cpp: Language = {
    vscodeId: 'cpp',
    type: items([]), type_data: items([]),
    call: items(calls), call_data: items([]),
    jump: items(jumps.concat(block.items(tags.jump, [
        'throw_statement', // then: coroutines (C++20)
        'co_return_statement', 'co_yield_statement', 'co_await_expression',
    ]))),
    loop: items(loops),
    flow: items(flows.concat(flow.items(
        tags.flow, ['try_statement'], ['catch_clause'],
        'compound_statement', false, true, false,
    ))),
};
