import { Language } from ".";
import { QueryItem } from "../queries";
import * as fun from "../queries/function";

export const Rust: Language = {
    vscodeId: 'rust',
    function: [
        fun.queryItem({
            fun: 'function_item', body: 'block',
            name: 'identifier', args: 'parameters',
        }),
        new QueryItem(fun.tag.fun, 'macro_definition', [
            new QueryItem(fun.tag.name, 'identifier'),
            new QueryItem(null, 'macro_rule', [
                new QueryItem(fun.tag.args, 'token_tree_pattern'),
                new QueryItem(fun.tag.body, 'token_tree'),
            ]),
        ]),
    ],
};
