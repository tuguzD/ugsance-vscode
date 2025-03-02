import Parser from "web-tree-sitter";
import { Tag } from "./tag";

export class QueryItem {
    tag: Tag | null;
    type: string | null;
    children: Array<QueryItem>;
    optional: boolean;
    repeat: boolean;

    get query(): string {
        let children: string = this.children.map(
            item => `\n${item.query}`
        ).join('');
        let tag: string = (this.tag != null) ? `@${this.tag}` : '';

        let optional = this.optional ? '?' : '';
        let repeat = this.repeat ? '*' : '';

        return `( ${this.type} ${children})${optional}${repeat} ${tag} `;
    }

    constructor(
        tag: Tag | null, type: string,
        children: Array<QueryItem> = [],
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
        let children: string = this.children.map(
            item => `\n${item.query}`
        ).join('');
        let optional = this.optional ? '?' : '';
        let repeat = this.repeat ? '*' : '';
        return `[ ${children} ]${optional}${repeat} `;
    }

    constructor(
        tag: Tag | null, children: Array<QueryItem> = [],
        optional = false, repeat = false, type = null,
    ) {
        super(tag, '', children, optional, repeat);
        this.type = type;
    }
}

export function queryItems(tag: Tag, types: string[]): QueryItem[] {
    return types.map(type => new QueryItem(tag, type));
}

export function buildQuery(queryType: QueryItem[]) {
    return queryType.map(item => item.query).join('\n\n');
}

export function captures(
    node: Parser.SyntaxNode, query: string, parser: Parser.Language,
): Parser.QueryCapture[] {
    return parser.query(query).captures(node);
}

export function filterTag(
    captures: Parser.QueryCapture[], tag: Tag | null = null,
) {
    return (tag == null) ? captures
        : captures.filter(item => item.name === tag);
}
