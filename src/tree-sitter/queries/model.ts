import { Tag } from ".";

type Input = {
    tag: Tag | null;
    type: string;
    name: string,
    children: QueryItem[];
    option: boolean;
    repeat: boolean;
}

export class QueryItem {
    tag: Tag | null;
    type: string | null;
    name: string | null;
    children: QueryItem[];
    option: boolean;
    repeat: boolean;

    protected get children_map(): string {
        return this.children.map(
            item => `\n${item.query}`
        ).join('');
    }
    protected get modifier(): string {
        const option = this.option ? '?' : '';
        const repeat = this.repeat ? '*' : '';
        return option + repeat;
    }

    get query(): string {
        const children = this.children_map;
        const tag = (this.tag !== null) ? `@${this.tag}` : '';
        const name = (this.name !== null) ? `${this.name}: ` : '';

        return `${name}( ${this.type} ${children})${this.modifier} ${tag} `;
    }

    constructor(input: Partial<Input>) {
        this.tag = input.tag || null;
        this.type = input.type || null;
        this.name = input.name || null;
        this.children = input.children || [];
        this.option = input.option || false;
        this.repeat = input.repeat || false;
    }
};

export class Alternation extends QueryItem {
    get query(): string {
        return `[ ${this.children_map} ]${this.modifier} `;
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
