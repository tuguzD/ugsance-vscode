import { Language } from "../model";
import { queryItems } from "../../queries";
import { tags } from "../../queries/tag";
import * as unit from "../../queries/items/call-unit";
import * as loop from "../../queries/items/loop";

export const Go: Language = {
    vscodeId: 'go',
    jump: queryItems(tags.jump, [
        'return_statement', 'goto_statement',
        'fallthrough_statement',
        'break_statement', 'continue_statement',
    ]),
    callUnit: [
        unit.queryItem({
            unit: 'function_declaration', body: 'block',
            name: 'identifier', args: 'parameter_list',
        }),
        unit.queryItem({
            unit: 'method_declaration', body: 'block',
            name: 'field_identifier', args: 'parameter_list',
        }),
    ],
    flow: [
        // todo
/*

( if_statement
( block ) @body
) @flow

( select_statement 
( communication_case ) @body
) @flow

( expression_switch_statement [
( expression_case ) @body
( default_case ) @body
] ) @flow

( type_switch_statement [
( type_case ) @body
( default_case ) @body
] ) @flow

*/
    ],
    loop: [loop.queryItem({loop: 'for_statement', body: 'block'})],
};
