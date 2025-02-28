import { Language } from ".";
import { QueryItem } from "../queries";
import { tag } from "../queries/function";

export const C: Language = {
    vscodeId: 'c',
    callUnit: [
        cQueryItem(false),
    ],
};
export const Cpp: Language = {
    vscodeId: 'cpp',
    callUnit: [
        cQueryItem(true),
        cQueryItem(false),
    ],
};

function cQueryItem(method: boolean) {
    let identifier = (method ? 'field_' : '') + 'identifier';
    return new QueryItem(
        tag.call, 'function_definition', [
        new QueryItem(tag.body, 'function_declarator', [
            new QueryItem(tag.name, identifier),
            new QueryItem(tag.args, 'formal_parameters'),
        ]),
        new QueryItem(tag.body, 'compound_statement'),
    ]);
}
