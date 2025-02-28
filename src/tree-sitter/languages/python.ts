import { Language } from ".";
import * as fun from "../queries/function";

export const Python: Language = {
    vscodeId: 'python',
    function: [
        fun.queryItem({
            fun: 'function_definition', body: 'block',
            name: 'identifier', args: 'parameters',
        }),
    ],
};
