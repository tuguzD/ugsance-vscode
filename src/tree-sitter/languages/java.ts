import { Language } from ".";
import * as call from "../queries/function";

export const Java: Language = {
    vscodeId: 'java',
    callUnit: [
        call.queryItem({
            call: 'method_declaration', name: 'identifier',
            body: 'block', args: 'formal_parameters',
        }),
        call.queryItem({
            call: 'constructor_declaration', name: 'identifier',
            body: 'constructor_body', args: 'formal_parameters',
        }),
        call.queryItem({
            call: 'synchronized_statement', name: null,
            body: 'block', args: 'parenthesized_expression',
        }),
    ],
};
