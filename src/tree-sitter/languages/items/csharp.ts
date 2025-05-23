import { Language } from "../model";
import { Alternation, QueryItem } from "../../queries/model";
import { tags } from "../../queries";
import * as block from "../../queries/items/block";
import * as flow from "../../queries/items/flow";
import * as call from "../../queries/items/call";
import { items } from ".";

function callItems(types: string[]): QueryItem[] {
    return types.map(item => call.item({
        item: item, body: 'block', args: 'parameter_list',
        name: item.includes('anonymous') ? null : 'identifier',
    }));
}
function arrowBody(option = true): QueryItem {
    return new Alternation({
        children: [
            new QueryItem({ tag: tags.call.body, type: 'block' }),
            new QueryItem({ tag: tags.call.body, type: 'arrow_expression_clause' }),
        ], option
    });
}

const calls = callItems([
    'method_declaration', 'local_function_statement',
    'anonymous_method_expression', // no "name" tag
]).concat([
    new QueryItem({
        tag: tags.call.item, type: 'constructor_declaration',
        children: [
            new QueryItem({ tag: tags.call.name, type: 'identifier' }),
            new QueryItem({ tag: tags.call.args, type: 'parameter_list' }),
            arrowBody(false),
        ],
    }),
    new QueryItem({
        tag: tags.call.item, type: 'property_declaration', 
        children: [
            new QueryItem({ tag: tags.call.name, type: 'identifier' }),
            new QueryItem({ type: 'accessor_list', children: [
                new QueryItem({ type: 'accessor_declaration', children: [arrowBody()] }),
            ],
        }),
    ]}),
]);
const jumps = block.items(tags.jump, [
    'return_statement',
    'goto_statement', 'yield_statement',
    'break_statement', 'continue_statement',
    'throw_statement', 'throw_expression',
]);
const flows: QueryItem[] = [
    ...block.items(tags.flow,
        ['if_statement', 'lock_statement'],
    'statement'),
    ...flow.items(tags.flow, ['switch_statement'],
        ['switch_body'], 'switch_section',
    false, false, false),
    ...flow.items(tags.flow, ['try_statement'],
        ['catch_clause', 'finally_clause'],
    'block'),
];
const loops = block.items(tags.loop, [
    'do_statement', 'while_statement',
    'for_statement', 'foreach_statement',
], 'statement');

export const CSharp: Language = {
    vscodeId: 'csharp',
    type: items([]), type_data: items([]),
    call: items(calls), call_data: items([]),
    jump: items(jumps), loop: items(loops), flow: items(flows),
};
