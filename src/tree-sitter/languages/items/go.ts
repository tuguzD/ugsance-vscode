import { Language } from "../model";
import { tags } from "../../queries";
import * as block from "../../queries/items/block";
import * as flow from "../../queries/items/flow";
import * as call from "../../queries/items/call";
import { items } from ".";

const calls = [
    call.item({
        item: 'function_declaration', body: 'block',
        name: 'identifier', args: 'parameter_list',
    }),
    call.item({
        item: 'method_declaration', body: 'block',
        name: 'field_identifier', args: 'parameter_list',
    }),
];
const jumps = block.items(tags.jump, [
    'return_statement', 'goto_statement',
    'fallthrough_statement',
    'break_statement', 'continue_statement',
]);
const flows = [
    ...block.items(tags.flow, ['if_statement'], 'block'),
    ...block.items(tags.flow, ['select_statement'], 'communication_case'),
    ...flow.items(tags.flow, ['expression_switch_statement'],
        ['expression_case', 'default_case'], '',
    true, false, false, false, false),
    ...flow.items(tags.flow, ['type_switch_statement'],
        ['type_case', 'default_case'], '',
    true, false, false, false, false),
];
const loops = block.items(tags.loop, ['for_statement'], 'block');

export const Go: Language = {
    vscodeId: 'go',
    type: items([]), type_data: items([]),
    call: items(calls), call_data: items([]),
    jump: items(jumps), loop: items(loops), flow: items(flows),
};
