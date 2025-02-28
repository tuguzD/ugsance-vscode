import { Language } from ".";
import { Alternation, QueryItem } from "../queries";
import * as fun from "../queries/function";

export const CSharp: Language = {
    vscodeId: 'csharp',
    function: [
        fun.queryItem({
            fun: 'method_declaration', body: 'block',
            name: 'identifier', args: 'parameter_list',
        }),
        fun.queryItem({
            fun: 'local_function_statement', body: 'block',
            name: 'identifier', args: 'parameter_list',
        }),
        new QueryItem(fun.tag.fun, 'anonymous_method_expression', [
            new QueryItem(fun.tag.args, 'parameter_list'),
            new QueryItem(fun.tag.body, 'block'),
        ]),
        new QueryItem(fun.tag.fun, 'constructor_declaration', [
            new QueryItem(fun.tag.name, 'identifier'),
            new QueryItem(fun.tag.args, 'parameter_list'),
            new Alternation(null, [
                new QueryItem(fun.tag.body, 'block'),
                new QueryItem(fun.tag.body, 'arrow_expression_clause'),
            ], false),
        ]),
        new QueryItem(fun.tag.fun, 'property_declaration', [
            new QueryItem(fun.tag.name, 'identifier'),
            new QueryItem(null, 'accessor_list', [
                new QueryItem(null, 'accessor_declaration', [
                    new Alternation(null, [
                        new QueryItem(fun.tag.body, 'block'),
                        new QueryItem(fun.tag.body, 'arrow_expression_clause'),
                    ], true),
                ]),
            ]),
        ]),
    ],
};
