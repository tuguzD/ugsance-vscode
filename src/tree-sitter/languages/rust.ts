import { Language } from ".";
import { QueryItem } from "../queries";
import * as unit from "../queries/call-unit";

export const Rust: Language = {
    vscodeId: 'rust',
    callUnit: [
        unit.queryItem({
            unit: 'function_item', body: 'block',
            name: 'identifier', args: 'parameters',
        }),
        new QueryItem(unit.tag.unit, 'macro_definition', [
            new QueryItem(unit.tag.name, 'identifier'),
            new QueryItem(null, 'macro_rule', [
                new QueryItem(unit.tag.args, 'token_tree_pattern'),
                new QueryItem(unit.tag.body, 'token_tree'),
            ]),
        ]),
        unit.queryItem({
            unit: 'closure_expression', body: 'block',
            name: null, args: 'closure_parameters',
        }),
        new QueryItem(null, '', [
            new QueryItem(unit.tag.body, 'block', [
                new QueryItem(null, 'label', [
                    new QueryItem(unit.tag.name, 'identifier'),
                ], true),
            ]),
        ]),
    ],
};
