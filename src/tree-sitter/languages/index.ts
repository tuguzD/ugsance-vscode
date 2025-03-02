import Parser from "web-tree-sitter";

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
