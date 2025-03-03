import { nullCheck } from "../../utils";
import { Language } from "./model";

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

export function find(name: string) {
    const item = list.find(item => item.vscodeId == name);
    nullCheck(item, `The language '${name}' is not (currently) supported!`);
    return item;
}
