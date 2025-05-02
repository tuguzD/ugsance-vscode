import { Language } from "../model";
import { Alternation, QueryItem } from "../../queries/model";
import { tags } from "../../queries";
import * as block from "../../queries/items/block";
import * as flow from "../../queries/items/flow";
import * as call from "../../queries/items/call";
import { items } from ".";

function callItem(item: string, name: boolean, method: boolean = false) {
    let identifier = (method ? 'property_' : '') + 'identifier';
    return call.item({
        item, name: name ? identifier : null,
        body: 'statement_block', args: 'formal_parameters',
    });
}

const calls = [
    callItem('arrow_function', false),
    callItem('generator_function', false),
    callItem('function_expression', false),
    callItem('method_definition', true, true),
    callItem('function_declaration', true, false),
    callItem('generator_function_declaration', true, false),
];
const jumps = block.items(tags.jump, [
    'return_statement', 'throw_statement',
    'break_statement', 'continue_statement',
    'yield_expression', 'await_expression',
]);
const flows = [
    ...flow.items(tags.flow, ['if_statement'],
        ['else_clause'], 'statement',
    false, true, false, true),
    new QueryItem({
        tag: tags.flow.item, type: 'switch_statement', children: [
        new QueryItem({type: 'switch_body', children: [
            new Alternation({ children: [
                new QueryItem({ tag: tags.flow.body, type: 'switch_case' }),
                new QueryItem({ tag: tags.flow.body, type: 'switch_default' }),
            ]}),
        ]}),
    ]}),
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
    type: items([]), type_data: items([]),
    call: items(calls), call_data: items([]),
    jump: items(jumps), loop: items(loops), flow: items(flows),
};
export const TypeScript: Language = {
    vscodeId: 'typescript',
    type: items([]), type_data: items([]),
    call: items(calls), call_data: items([]),
    jump: items(jumps), loop: items(loops), flow: items(flows),
};
