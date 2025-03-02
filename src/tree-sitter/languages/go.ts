import { Language } from ".";
import * as unit from "../queries/call-unit";

export const Go: Language = {
    vscodeId: 'go',
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
