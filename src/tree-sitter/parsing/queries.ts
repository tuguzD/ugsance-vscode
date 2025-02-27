import { Language } from "./languages";

export class QueryItem {
    tag: string;
    type: string;
    children: Array<QueryItem>;

    get query(): string {
        let children: string = this.children.map(
            item => `\n${item.query}`
        ).join('');
        return `( ${this.type} ${children}) @${this.tag} `;
    }

    constructor(
        tag: string, type: string,
        children: Array<QueryItem> = [],
    ) {
        this.tag = tag;
        this.type = type;
        this.children = children;
    }
};

type Function = {
    fun: string, name: string,
    args: string, body: string,
};
export const tag: Function = {
    fun: 'function', name: 'name',
    args: 'args', body: 'body',
};
export function functionQuery(type: Function) {
    return new QueryItem(
        tag.fun, type.fun, [
        new QueryItem(tag.name, type.name),
        new QueryItem(tag.args, type.args),
        new QueryItem(tag.body, type.body),
    ]);
}

export function functions(language: Language): string {
    return language.function.map(
        item => item.query
    ).join('');
}
