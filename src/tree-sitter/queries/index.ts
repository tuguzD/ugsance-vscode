import Parser from "web-tree-sitter";

export class QueryItem {
    tag: string | null;
    type: string;
    children: Array<QueryItem>;

    get query(): string {
        let children: string = this.children.map(
            item => `\n${item.query}`
        ).join('');
        let tag: string = (this.tag != null) ? `@${this.tag}` : '';
        return `( ${this.type} ${children}) ${tag} `;
    }

    constructor(
        tag: string | null, type: string,
        children: Array<QueryItem> = [],
    ) {
        this.tag = tag;
        this.type = type;
        this.children = children;
    }
};

export function capturedQuery(
    node: Parser.SyntaxNode, queryType: QueryItem[],
    parser: Parser.Language, captureTag: string | null = null,
): Parser.QueryCapture[] {
    let query = queryType.map(item => item.query).join('\n\n');
    let captures = parser.query(query).captures(node);

    return (captureTag == null) ? captures
        : captures.filter(item => item.name === captureTag);
}
