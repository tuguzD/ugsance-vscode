import { Tag } from ".";

export class QueryItem {
    tag: Tag | null;
    type: string | null;
    children: QueryItem[];
    optional: boolean;
    repeat: boolean;

    get query(): string {
        const children: string = this.children.map(
            item => `\n${item.query}`
        ).join('');
        const tag = (this.tag !== null) ? `@${this.tag}` : '';
        const optional = this.optional ? '?' : '';
        const repeat = this.repeat ? '*' : '';

        const modifier = optional + repeat;
        return `( ${this.type} ${children})${modifier} ${tag} `;
    }

    constructor(
        tag: Tag | null, type: string,
        children: QueryItem[] = [],
        optional = false, repeat = false,
    ) {
        this.tag = tag;
        this.type = type;
        this.children = children;
        this.optional = optional;
        this.repeat = repeat;
    }
};

export class Alternation extends QueryItem {
    get query(): string {
        const children: string = this.children.map(
            item => `\n${item.query}`
        ).join('');
        const optional = this.optional ? '?' : '';
        const repeat = this.repeat ? '*' : '';
        return `[ ${children} ]${optional}${repeat} `;
    }

    constructor(
        tag: Tag | null, children: QueryItem[] = [],
        optional = false, repeat = false, type = null,
    ) {
        super(tag, '', children, optional, repeat);
        this.type = type;
    }
}

export class QueryItems {
    list: QueryItem[];
    constructor(query: QueryItem[]) {
        this.list = query;
    }
    toString(separator = '\n\n'): string {
        return this.list
            .map(item => item.query)
            .join(separator);
    }
}
