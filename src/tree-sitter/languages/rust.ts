import { Language } from ".";
import { QueryItem, queryItems } from "../queries";
import { tags } from "../queries/tag";
import * as unit from "../queries/call-unit";
import * as loop from "../queries/loop";

export const Rust: Language = {
    vscodeId: 'rust',
    jump: queryItems(tags.jump, [
        'return_expression',
        'yield_expression', 'await_expression',
        'break_expression', 'continue_expression',
    ]),
    loop: loop.queryItems('block', [
        'for_expression', 'loop_expression',
        'while_expression', 'try_block',
    ]),
    callUnit: [
        unit.queryItem({
            unit: 'function_item', body: 'block',
            name: 'identifier', args: 'parameters',
        }),
        new QueryItem(tags.unit.unit, 'macro_definition', [
            new QueryItem(tags.unit.name, 'identifier'),
            new QueryItem(null, 'macro_rule', [
                new QueryItem(tags.unit.args, 'token_tree_pattern'),
                new QueryItem(tags.unit.body, 'token_tree'),
            ]),
        ]),
        unit.queryItem({
            unit: 'closure_expression', body: 'block',
            name: null, args: 'closure_parameters',
        }),
        new QueryItem(null, '', [
            new QueryItem(tags.unit.body, 'block', [
                new QueryItem(null, 'label', [
                    new QueryItem(tags.unit.name, 'identifier'),
                ], true),
            ]),
        ]),
    ],
};
