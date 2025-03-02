import { Language } from "../model";
import { tags } from "../../queries/tag";
import * as block from "../../queries/items/block";
import * as unit from "../../queries/items/call-unit";

const callUnits = [
    unit.queryItem({
        item: 'function_declaration', body: 'block',
        name: 'identifier', args: 'parameter_list',
    }),
    unit.queryItem({
        item: 'method_declaration', body: 'block',
        name: 'field_identifier', args: 'parameter_list',
    }),
];
const jumps = block.items(tags.jump, [
    'return_statement', 'goto_statement',
    'fallthrough_statement',
    'break_statement', 'continue_statement',
]);
const loops = block.items(tags.loop, ['for_statement'], 'block');
const flows = [
    ...block.items(tags.flow, ['if_statement'], 'block'),
    ...block.items(tags.flow, ['select_statement'], 'communication_case'),
];
/*
( expression_switch_statement [
( expression_case ) @body
( default_case ) @body
] ) @flow

( type_switch_statement [
( type_case ) @body
( default_case ) @body
] ) @flow
*/

export const Go: Language = {
    vscodeId: 'go',
    jump: jumps,
    loop: loops, flow: flows,
    callUnit: callUnits,
};
