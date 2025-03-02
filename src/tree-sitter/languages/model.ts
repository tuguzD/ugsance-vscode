import { QueryItem } from "../queries/model";

type I = QueryItem[];
export type Language = {
    vscodeId: string,
    jump: I,
    loop: I, flow: I,
    callUnit: I,
};

import { Go } from "./items/go";
import { C, Cpp } from "./items/c";
import { Rust } from "./items/rust";
import { Java } from "./items/java";
import { CSharp } from "./items/csharp";
import { Python } from "./items/python";
import { JavaScript, TypeScript } from "./items/js";

export const list: Language[] = [
    C, Cpp, Rust, Go,
    Java, CSharp, Python,
    JavaScript, TypeScript,
];
