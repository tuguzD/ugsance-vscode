import { Language } from ".";
import { QueryItem } from "../queries";
import * as call from "../queries/function";

export const Rust: Language = {
    vscodeId: 'rust',
    callUnit: [
        call.queryItem({
            call: 'function_item', body: 'block',
            name: 'identifier', args: 'parameters',
        }),
        new QueryItem(call.tag.call, 'macro_definition', [
            new QueryItem(call.tag.name, 'identifier'),
            new QueryItem(null, 'macro_rule', [
                new QueryItem(call.tag.args, 'token_tree_pattern'),
                new QueryItem(call.tag.body, 'token_tree'),
            ]),
        ]),
    ],
};
