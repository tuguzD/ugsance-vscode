import { QueryItem } from "../queries";
import * as fun from "../queries/function";

export type Language = {
    vscodeId: string;
    function: QueryItem[];
};

const Rust: Language = {
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
const Go: Language = {
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

const Java: Language = {
    vscodeId: 'java',
    function: [
        fun.queryItem({
            fun: 'method_declaration', body: 'block',
            name: 'identifier', args: 'formal_parameters',
        }),
    ],
};
const CSharp: Language = {
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
    ],
};
const Python: Language = {
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

export const languages: Language[] = [
    C, Cpp, Rust, Go,
    Java, CSharp, Python,
    JavaScript, TypeScript,
];
