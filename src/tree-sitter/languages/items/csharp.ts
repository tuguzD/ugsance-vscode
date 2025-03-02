import { Language } from "../model";
import { queryItems } from "../../queries";
import { Alternation, QueryItem } from "../../queries/model";
import { tags } from "../../queries/tag";
import * as unit from "../../queries/items/call-unit";
import * as loop from "../../queries/items/loop";

export const CSharp: Language = {
    vscodeId: 'csharp',
    jump: queryItems(tags.jump, [
        'return_statement',
        'goto_statement', 'yield_statement',
        'break_statement', 'continue_statement',
        'throw_statement', 'throw_expression',
    ]),
    loop: loop.queryItems('statement', [
        'do_statement', 'while_statement',
        'for_statement', 'foreach_statement',
    ]),
    callUnit: [
        unit.queryItem({
            unit: 'method_declaration', body: 'block',
            name: 'identifier', args: 'parameter_list',
        }),
        unit.queryItem({
            unit: 'local_function_statement', body: 'block',
            name: 'identifier', args: 'parameter_list',
        }),
        unit.queryItem({
            unit: 'anonymous_method_expression', name: null,
            args: 'parameter_list', body: 'block',
        }),
        new QueryItem(tags.unit.unit, 'constructor_declaration', [
            new QueryItem(tags.unit.name, 'identifier'),
            new QueryItem(tags.unit.args, 'parameter_list'),
            new Alternation(null, [
                new QueryItem(tags.unit.body, 'block'),
                new QueryItem(tags.unit.body, 'arrow_expression_clause'),
            ], false),
        ]),
        new QueryItem(tags.unit.unit, 'property_declaration', [
            new QueryItem(tags.unit.name, 'identifier'),
            new QueryItem(null, 'accessor_list', [
                new QueryItem(null, 'accessor_declaration', [
                    new Alternation(null, [
                        new QueryItem(tags.unit.body, 'block'),
                        new QueryItem(tags.unit.body, 'arrow_expression_clause'),
                    ], true),
                ]),
            ]),
        ]),
    ],
};
