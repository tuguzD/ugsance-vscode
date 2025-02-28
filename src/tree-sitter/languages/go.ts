import { Language } from ".";
import * as fun from "../queries/function";

export const Go: Language = {
    vscodeId: 'go',
    function: [
        fun.queryItem({
            fun: 'function_declaration', body: 'block',
            name: 'identifier', args: 'parameter_list',
        }),
        fun.queryItem({
            fun: 'method_declaration', body: 'block',
            name: 'field_identifier', args: 'parameter_list',
        }),
    ],
};
