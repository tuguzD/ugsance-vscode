import Parser from "web-tree-sitter";

import { Alternation, QueryItem } from "../queries";
import * as fun from "../queries/function";

export async function init(
    parserPath: string, codeSource: string,
) {
    await Parser.init();
    const parser = new Parser();
    const langParser = await
        Parser.Language.load(parserPath);
    parser.setLanguage(langParser);

    const node = parser.parse(codeSource).rootNode;
    return { langParser, node };
}

export type Language = {
    vscodeId: string;
    function: QueryItem[];
};

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
export const Go: Language = {
    vscodeId: 'go',
    function: [
        fun.queryItem({
            fun: 'function_declaration', body: 'block',
            name: 'identifier', args: 'parameter_list',
        }),
        fun.queryItem({
            fun: 'method_declaration', body: 'block',
            name: 'field_identifier', args: 'parameter_list',
        }),
    ],
};

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
export const Python: Language = {
    vscodeId: 'python',
    function: [
        fun.queryItem({
            fun: 'function_definition', body: 'block',
            name: 'identifier', args: 'parameters',
        }),
    ],
};

import { C, Cpp } from "./c";
import { JavaScript, TypeScript } from "./js";

export const list: Language[] = [
    C, Cpp, Rust, Go,
    Java, CSharp, Python,
    JavaScript, TypeScript,
];
