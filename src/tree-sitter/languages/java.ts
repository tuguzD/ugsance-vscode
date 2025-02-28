import { Language } from ".";
import { QueryItem } from "../queries";
import * as fun from "../queries/function";

export const Java: Language = {
    vscodeId: 'java',
    function: [
        fun.queryItem({
            fun: 'method_declaration', body: 'block',
            name: 'identifier', args: 'formal_parameters',
        }),
        fun.queryItem({
            fun: 'constructor_declaration', body: 'constructor_body',
            name: 'identifier', args: 'formal_parameters',
        }),
        new QueryItem(fun.tag.fun, 'synchronized_statement', [
            new QueryItem(fun.tag.args, 'parenthesized_expression'),
            new QueryItem(fun.tag.body, 'block'),
        ]),
    ],
};
