import { Language } from "../model";
import { Alternation, QueryItem } from "../../queries/model";
import { tags } from "../../queries/tag";
import * as block from "../../queries/items/block";
import * as flow from "../../queries/items/flow";
import * as unit from "../../queries/items/call-unit";

const callUnits = [
    jsQueryItem('arrow_function', false),
    jsQueryItem('generator_function', false),
    jsQueryItem('function_expression', false),
    jsQueryItem('method_definition', true, true),
    jsQueryItem('function_declaration', true, false),
    jsQueryItem('generator_function_declaration', true, false),
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
    new QueryItem(tags.flow.item, 'switch_statement', [
        new QueryItem(null, 'switch_body', [new Alternation(null, [
            new QueryItem(tags.flow.body, 'switch_case'),
            new QueryItem(tags.flow.body, 'switch_default'),
        ])]),
    ]),
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
    jump: jumps,
    loop: loops, flow: flows,
    callUnit: callUnits,
};
export const TypeScript: Language = {
    vscodeId: 'typescript',
    jump: jumps,
    loop: loops, flow: flows,
    callUnit: callUnits,
};

function jsQueryItem(callUnit: string, name: boolean, method: boolean = false) {
    let identifier = (method ? 'property_' : '') + 'identifier';

    return unit.queryItem({
        item: callUnit, name: name ? identifier : null,
        body: 'statement_block', args: 'formal_parameters',
    });
}
