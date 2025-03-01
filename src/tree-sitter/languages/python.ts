import { Language } from ".";
import { Alternation, QueryItem } from "../queries";
import * as call from "../queries/function";

export const Python: Language = {
    vscodeId: 'python',
    callUnit: [
        call.queryItem({
            call: 'function_definition', body: 'block',
            name: 'identifier', args: 'parameters',
        }),
        new QueryItem(call.tag.call, 'lambda', [
            new Alternation(null, [
                new QueryItem(call.tag.args, 'lambda_parameters'),
                new QueryItem(call.tag.body, 'expression'),
            ],),
        ]),
    ],
};
