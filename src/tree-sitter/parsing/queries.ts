import { Language } from "./languages";

export type Function = {
    function: string | null;
    name: string | null;
    args: string | null;
    body: string | null;
};

function functionQuery(item: Function): string {
    return `( ${item.function}
( ${item.name} ) @name
( ${item.args} ) @args
( ${item.body} ) @body
) @function`;
}

export function functions(language: Language): string {
    return language.function.map(
        item => functionQuery(item)
    ).join();
}
