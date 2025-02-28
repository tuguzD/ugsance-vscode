import { Language } from ".";
import * as call from "../queries/function";

export const Python: Language = {
    vscodeId: 'python',
    callUnit: [
        call.queryItem({
            call: 'function_definition', body: 'block',
            name: 'identifier', args: 'parameters',
        }),
    ],
};
