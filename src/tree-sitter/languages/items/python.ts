import { Language } from "../model";
import { Alternation, QueryItem } from "../../queries/model";
import { tags } from "../../queries";
import * as block from "../../queries/items/block";
import * as flow from "../../queries/items/flow";
import * as call from "../../queries/items/call";
import { items } from ".";

const calls = [
    call.item({
        item: 'function_definition', body: 'block',
        name: 'identifier', args: 'parameters',
    }),
    new QueryItem({
        tag: tags.call.item, type: 'lambda',
        children: [new Alternation({ children: [
            new QueryItem({ tag: tags.call.args, type: 'lambda_parameters' }),
            new QueryItem({ tag: tags.call.body, type: 'expression' }),
        ]}),
    ]}),
];
const jumps = block.items(tags.jump, [
    'return_statement', 'await',
    'raise_statement', 'assert_statement',
    'break_statement', 'continue_statement',
]);
const flows = [
    ...flow.items(tags.flow, ['if_statement'],
        ['elif_clause', 'else_clause'],
    'block'),
    ...flow.items(tags.flow, ['match_statement'],
        ['block'], 'case_clause', false, false, false,
    ),
    ...flow.items(tags.flow, ['try_statement'], [
        'except_clause', 'except_group_clause',
        'else_clause', 'finally_clause',
    ], 'block'),
];
const loops = flow.items(tags.loop,
    ['for_statement', 'while_statement'],
    ['else_clause'], 'block',
);

export const Python: Language = {
    vscodeId: 'python',
    type: items([]), type_data: items([]),
    call: items(calls), call_data: items([]),
    jump: items(jumps), loop: items(loops), flow: items(flows),
};
