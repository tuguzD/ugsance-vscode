type Language = {
    vscodeId: string;
    function: string;
};

const Java: Language = {
    vscodeId: "java",
    function: "method_declaration",
};
const CSharp: Language = {
    vscodeId: "csharp",
    function: "",
};

const JavaScript: Language = {
    vscodeId: "javascript",
    function: "function_declaration",
};
const TypeScript: Language = {
    vscodeId: "typescript",
    function: "function_declaration",
};
/*
( method_definition ( property_identifier ) @names )
( function_declaration ( identifier ) @names )
( generator_function_declaration ( identifier ) @names )
*/
const Lua: Language = {
    vscodeId: "lua",
    function: "",
};

export const languages: Language[] = [
    Java, CSharp,
    JavaScript, TypeScript, Lua,
];
