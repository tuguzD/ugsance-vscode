import Parser from "web-tree-sitter";
import { QueryItem } from "./model";
import { Tag } from "./tag";

export async function init(
    parserPath: string, codeSource: string,
) {
    await Parser.init();
    const parser = new Parser();
    const langParser = await
        Parser.Language.load(parserPath);
    parser.setLanguage(langParser);

    const node = parser.parse(codeSource).rootNode;
    return { langParser, node };
}

export function buildQuery(queryType: QueryItem[]): string {
    return queryType.map(item => item.query).join('\n\n');
}

export function captures(
    node: Parser.SyntaxNode, query: string, parser: Parser.Language,
): Parser.QueryCapture[] {
    return parser.query(query).captures(node);
}

export function filterTag(
    captures: Parser.QueryCapture[], tag: Tag | null = null,
): Parser.QueryCapture[] {
    return (tag == null) ? captures
        : captures.filter(item => item.name === tag);
}
