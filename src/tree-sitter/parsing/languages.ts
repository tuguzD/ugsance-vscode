export type Language = {
    vscodeId: string;
    function: Map<string, string>;
};

const C: Language = {
    vscodeId: 'c',
    function: new Map([
        ['function_declarator', 'identifier'],
    ]),
};
const Cpp: Language = {
    vscodeId: 'cpp',
    function: new Map([
        ['function_declarator', 'identifier'],
        ['function_declarator', 'field_identifier'],
    ]),
};
const Rust: Language = {
    vscodeId: 'rust',
    function: new Map([
        ['function_item', 'identifier'],
        ['macro_definition', 'identifier'],
    ]),
};

const Go: Language = {
    vscodeId: 'go',
    function: new Map([
        ['function_declaration', 'identifier'],
        ['method_declaration', 'field_identifier'],
    ]),
};
// ToDo: test (somehow)
const Ruby: Language = {
    vscodeId: 'ruby',
    function: new Map([
        // empty
    ]),
};
// ToDo: test (somehow)
const Scala: Language = {
    vscodeId: 'scala',
    function: new Map([
        // empty
    ]),
};

const CSharp: Language = {
    vscodeId: 'csharp',
    function: new Map([
        ['method_declaration', 'identifier'],
        ['local_function_statement', 'identifier'],
    ]),
};
const Java: Language = {
    vscodeId: 'java',
    function: new Map([
        ['method_declaration', 'identifier'],
    ]),
};
// ToDo: test (somehow)
const Kotlin: Language = {
    vscodeId: 'kotlin',
    function: new Map([
        ['function_declaration', 'simple_identifier'],
        // 'anonymous_function'
    ]),
};
const Python: Language = {
    vscodeId: 'python',
    function: new Map([
        ['function_definition', 'identifier'],
    ]),
};

const JavaScript: Language = {
    vscodeId: 'javascript',
    function: new Map([
        ['method_definition', 'property_identifier'],
        ['function_declaration', 'identifier'],
        ['generator_function_declaration', 'identifier'],
    ]),
};
const TypeScript: Language = {
    vscodeId: 'typescript',
    function: new Map([
        ['method_definition', 'property_identifier'],
        ['function_declaration', 'identifier'],
        ['generator_function_declaration', 'identifier'],
    ]),
};
// ToDo: test (somehow)
const Lua: Language = {
    vscodeId: "lua",
    function: new Map([
        // 'function_definition'
        // ['function_declaration', 'function_name'],
        // ['local_function_declaration', 'identifier'],
    ]),
};

export const languages: Language[] = [
    C, Cpp, Rust, Go, Ruby, Scala,
    CSharp, Java, Kotlin, Python,
    JavaScript, TypeScript, Lua,
];
