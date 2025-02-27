import { QueryItem } from "../queries";
import { tag } from "../queries/function";

export type Language = {
    vscodeId: string;
    function: QueryItem[];
};

const C: Language = {
    vscodeId: 'c',
    function: [
        new QueryItem(
            tag.fun, 'function_definition', [
            new QueryItem(tag.body, 'function_declarator', [
                new QueryItem(tag.name, 'identifier'),
                new QueryItem(tag.args, 'formal_parameters'),
            ]),
            new QueryItem(tag.body, 'compound_statement'),
        ]),
    ],
};
const Cpp: Language = {
    vscodeId: 'cpp',
    function: [
        new QueryItem(
            tag.fun, 'function_definition', [
            new QueryItem(tag.body, 'function_declarator', [
                new QueryItem(tag.name, 'identifier'),
                new QueryItem(tag.args, 'formal_parameters'),
            ]),
            new QueryItem(tag.body, 'compound_statement'),
        ]),
        new QueryItem(
            tag.fun, 'function_definition', [
            new QueryItem(tag.body, 'function_declarator', [
                new QueryItem(tag.name, 'field_identifier'),
                new QueryItem(tag.args, 'formal_parameters'),
            ]),
            new QueryItem(tag.body, 'compound_statement'),
        ]),
    ],
};
const Rust: Language = {
    vscodeId: 'rust',
    function: [
        new QueryItem(
            tag.fun, 'function_item', [
            new QueryItem(tag.name, 'identifier'),
            new QueryItem(tag.args, 'parameters'),
            new QueryItem(tag.body, 'block'),
        ]),
        new QueryItem(
            tag.fun, 'macro_definition', [
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
    function: [],
    // new Map([
    //     ['function_declaration', 'identifier'],
    //     ['method_declaration', 'field_identifier'],
    // ]),
};
// ToDo: test (somehow)
const Ruby: Language = {
    vscodeId: 'ruby',
    function: [],
    // new Map([
    //     // empty
    // ]),
};
// ToDo: test (somehow)
const Scala: Language = {
    vscodeId: 'scala',
    function: [],
    // new Map([
    //     // empty
    // ]),
};

const CSharp: Language = {
    vscodeId: 'csharp',
    function: [
        new QueryItem(
            tag.fun, 'method_declaration', [
            new QueryItem(tag.name, 'identifier'),
            new QueryItem(tag.args, 'parameter_list'),
            new QueryItem(tag.body, 'block'),
        ]),
        new QueryItem(
            tag.fun, 'local_function_statement', [
            new QueryItem(tag.name, 'identifier'),
            new QueryItem(tag.args, 'parameter_list'),
            new QueryItem(tag.body, 'block'),
        ]),
    ],
};
const Java: Language = {
    vscodeId: 'java',
    function: [
        new QueryItem(
            tag.fun, 'method_declaration', [
            new QueryItem(tag.name, 'identifier'),
            new QueryItem(tag.args, 'formal_parameters'),
            new QueryItem(tag.body, 'block'),
        ]),
    ],
};
// ToDo: test (somehow)
const Kotlin: Language = {
    vscodeId: 'kotlin',
    function: [],
    // new Map([
    //     ['function_declaration', 'simple_identifier'],
    //     // 'anonymous_function'
    // ]),
};
const Python: Language = {
    vscodeId: 'python',
    function: [
        new QueryItem(
            tag.fun, 'function_definition', [
            new QueryItem(tag.name, 'identifier'),
            new QueryItem(tag.args, 'parameters'),
            new QueryItem(tag.body, 'block'),
        ]),
    ],
};

const JavaScript: Language = {
    vscodeId: 'javascript',
    function: [
        new QueryItem(
            tag.fun, 'arrow_function', [
            new QueryItem(tag.args, 'formal_parameters'),
            new QueryItem(tag.body, 'statement_block'),
        ]),
        new QueryItem(
            tag.fun, 'generator_function', [
            new QueryItem(tag.args, 'formal_parameters'),
            new QueryItem(tag.body, 'statement_block'),
        ]),
        new QueryItem(
            tag.fun, 'function_expression', [
            new QueryItem(tag.args, 'formal_parameters'),
            new QueryItem(tag.body, 'statement_block'),
        ]),
        new QueryItem(
            tag.fun, 'function_declaration', [
            new QueryItem(tag.name, 'identifier'),
            new QueryItem(tag.args, 'formal_parameters'),
            new QueryItem(tag.body, 'statement_block'),
        ]),
        new QueryItem(
            tag.fun, 'generator_function_declaration', [
            new QueryItem(tag.name, 'identifier'),
            new QueryItem(tag.args, 'formal_parameters'),
            new QueryItem(tag.body, 'statement_block'),
        ]),
        new QueryItem(
            tag.fun, 'method_definition', [
            new QueryItem(tag.name, 'property_identifier'),
            new QueryItem(tag.args, 'formal_parameters'),
            new QueryItem(tag.body, 'statement_block'),
        ]),
    ],
};
const TypeScript: Language = {
    vscodeId: 'typescript',
    function: [],
    // new Map([
    //     ['method_definition', 'property_identifier'],
    //     ['function_declaration', 'identifier'],
    //     ['generator_function_declaration', 'identifier'],
    // ]),
};
// ToDo: test (somehow)
const Lua: Language = {
    vscodeId: "lua",
    function: [],
    // new Map([
    //     // 'function_definition'
    //     // ['function_declaration', 'function_name'],
    //     // ['local_function_declaration', 'identifier'],
    // ]),
};

export const languages: Language[] = [
    C, Cpp, Rust, Go, Ruby, Scala,
    CSharp, Java, Kotlin, Python,
    JavaScript, TypeScript, Lua,
];
