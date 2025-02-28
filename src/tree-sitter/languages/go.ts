import { Language } from ".";
import * as call from "../queries/function";

export const Go: Language = {
    vscodeId: 'go',
    callUnit: [
        call.queryItem({
            call: 'function_declaration', body: 'block',
            name: 'identifier', args: 'parameter_list',
        }),
        call.queryItem({
            call: 'method_declaration', body: 'block',
            name: 'field_identifier', args: 'parameter_list',
        }),
    ],
};
