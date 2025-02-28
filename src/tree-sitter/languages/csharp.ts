import { Language } from ".";
import { Alternation, QueryItem } from "../queries";
import * as call from "../queries/function";

export const CSharp: Language = {
    vscodeId: 'csharp',
    callUnit: [
        call.queryItem({
            call: 'method_declaration', body: 'block',
            name: 'identifier', args: 'parameter_list',
        }),
        call.queryItem({
            call: 'local_function_statement', body: 'block',
            name: 'identifier', args: 'parameter_list',
        }),
        call.queryItem({
            call: 'anonymous_method_expression', name: null,
            args: 'parameter_list', body: 'block',
        }),
        new QueryItem(call.tag.call, 'constructor_declaration', [
            new QueryItem(call.tag.name, 'identifier'),
            new QueryItem(call.tag.args, 'parameter_list'),
            new Alternation(null, [
                new QueryItem(call.tag.body, 'block'),
                new QueryItem(call.tag.body, 'arrow_expression_clause'),
            ], false),
        ]),
        new QueryItem(call.tag.call, 'property_declaration', [
            new QueryItem(call.tag.name, 'identifier'),
            new QueryItem(null, 'accessor_list', [
                new QueryItem(null, 'accessor_declaration', [
                    new Alternation(null, [
                        new QueryItem(call.tag.body, 'block'),
                        new QueryItem(call.tag.body, 'arrow_expression_clause'),
                    ], true),
                ]),
            ]),
        ]),
    ],
};
