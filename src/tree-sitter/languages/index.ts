import Parser from "web-tree-sitter";

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

import { QueryItem } from "../queries";

export type Language = {
    vscodeId: string;
    callUnit: QueryItem[];
};

import { Go } from "./go";
import { C, Cpp } from "./c";
import { Rust } from "./rust";
import { Java } from "./java";
import { CSharp } from "./csharp";
import { Python } from "./python";
import { JavaScript, TypeScript } from "./js";

export const list: Language[] = [
    C, Cpp, Rust, Go,
    Java, CSharp, Python,
    JavaScript, TypeScript,
];
