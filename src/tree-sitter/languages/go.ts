import { Language } from ".";
import { queryItems } from "../queries";
import * as unit from "../queries/call-unit";
import { tags } from "../queries/tag";

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
};
