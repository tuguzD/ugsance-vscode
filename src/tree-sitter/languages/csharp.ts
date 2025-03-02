import { Language } from ".";
import { Alternation, QueryItem } from "../queries";
import * as unit from "../queries/call-unit";

export const CSharp: Language = {
    vscodeId: 'csharp',
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
        new QueryItem(unit.tag.unit, 'constructor_declaration', [
            new QueryItem(unit.tag.name, 'identifier'),
            new QueryItem(unit.tag.args, 'parameter_list'),
            new Alternation(null, [
                new QueryItem(unit.tag.body, 'block'),
                new QueryItem(unit.tag.body, 'arrow_expression_clause'),
            ], false),
        ]),
        new QueryItem(unit.tag.unit, 'property_declaration', [
            new QueryItem(unit.tag.name, 'identifier'),
            new QueryItem(null, 'accessor_list', [
                new QueryItem(null, 'accessor_declaration', [
                    new Alternation(null, [
                        new QueryItem(unit.tag.body, 'block'),
                        new QueryItem(unit.tag.body, 'arrow_expression_clause'),
                    ], true),
                ]),
            ]),
        ]),
    ],
};
