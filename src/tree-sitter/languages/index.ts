import { QueryItem } from "../queries";
import { tag } from "../queries/function";

export type Language = {
    vscodeId: string;
    function: QueryItem[];
};

const Rust: Language = {
    vscodeId: 'rust',
    function: [
        new QueryItem(tag.fun, 'function_item', [
            new QueryItem(tag.name, 'identifier'),
            new QueryItem(tag.args, 'parameters'),
            new QueryItem(tag.body, 'block'),
        ]),
        new QueryItem(tag.fun, 'macro_definition', [
            new QueryItem(tag.name, 'identifier'),
            new QueryItem(null, 'macro_rule', [
                new QueryItem(tag.args, 'token_tree_pattern'),
                new QueryItem(tag.body, 'token_tree'),
            ]),
        ]),
    ],
};
const Go: Language = {
    vscodeId: 'go',
    function: [
        new QueryItem(tag.fun, 'function_declaration', [
            new QueryItem(tag.name, 'identifier'),
            new QueryItem(tag.args, 'parameter_list'),
            new QueryItem(tag.body, 'block'),
        ]),
        new QueryItem(tag.fun, 'method_declaration', [
            new QueryItem(tag.name, 'field_identifier'),
            new QueryItem(tag.args, 'parameter_list'),
            new QueryItem(tag.body, 'block'),
        ]),
    ],
};

const Java: Language = {
    vscodeId: 'java',
    function: [
        new QueryItem(tag.fun, 'method_declaration', [
            new QueryItem(tag.name, 'identifier'),
            new QueryItem(tag.args, 'formal_parameters'),
            new QueryItem(tag.body, 'block'),
        ]),
    ],
};
const CSharp: Language = {
    vscodeId: 'csharp',
    function: [
        new QueryItem(tag.fun, 'method_declaration', [
            new QueryItem(tag.name, 'identifier'),
            new QueryItem(tag.args, 'parameter_list'),
            new QueryItem(tag.body, 'block'),
        ]),
        new QueryItem(tag.fun, 'local_function_statement', [
            new QueryItem(tag.name, 'identifier'),
            new QueryItem(tag.args, 'parameter_list'),
            new QueryItem(tag.body, 'block'),
        ]),
    ],
};
const Python: Language = {
    vscodeId: 'python',
    function: [
        new QueryItem(tag.fun, 'function_definition', [
            new QueryItem(tag.name, 'identifier'),
            new QueryItem(tag.args, 'parameters'),
            new QueryItem(tag.body, 'block'),
        ]),
    ],
};

import { C, Cpp } from "./c";
import { JavaScript, TypeScript } from "./js";

export const languages: Language[] = [
    C, Cpp, Rust, Go,
    Java, CSharp, Python,
    JavaScript, TypeScript,
];
