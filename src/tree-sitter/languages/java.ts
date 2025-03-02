import { Language } from ".";
import * as unit from "../queries/call-unit";

export const Java: Language = {
    vscodeId: 'java',
    callUnit: [
        unit.queryItem({
            unit: 'method_declaration', name: 'identifier',
            body: 'block', args: 'formal_parameters',
        }),
        unit.queryItem({
            unit: 'constructor_declaration', name: 'identifier',
            body: 'constructor_body', args: 'formal_parameters',
        }),
        unit.queryItem({
            unit: 'synchronized_statement', name: null,
            body: 'block', args: 'parenthesized_expression',
        }),
    ],
};
