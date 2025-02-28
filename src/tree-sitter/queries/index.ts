import Parser from "web-tree-sitter";

export async function initLanguage(
    parserPath: string, codeSource: string,
) {
    await Parser.init();
    const parser = new Parser();
    const lang = await Parser.Language.load(parserPath);
    parser.setLanguage(lang);

    const node = parser.parse(codeSource).rootNode;
    return { lang, node };
}

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

export function captures(
    node: Parser.SyntaxNode, queryType: QueryItem[], parser: Parser.Language,
): Parser.QueryCapture[] {
    let query = queryType.map(item => item.query).join('\n\n');
    return parser.query(query).captures(node);
}

export function filterTag(
    captures: Parser.QueryCapture[], tag: string | null = null,
) {
    return (tag == null) ? captures
        : captures.filter(item => item.name === tag);
}
