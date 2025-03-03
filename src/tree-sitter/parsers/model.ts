import T from "web-tree-sitter";
import * as files from 'fs';
import { nullCheck } from "../../utils";

import { find } from "../languages";
import { Language } from "../languages/model";

// import { QueryItem } from "./queries/model";
// import { Tag } from "./queries/tag";

export class Parser {
    private parser: T = new T();
    language!: T.Language;

    rootNode!: T.SyntaxNode;
    langData!: Language;

    // build(queryType: QueryItem[]): string {
    //     return queryType.map(item => item.query).join('\n\n');
    // }
    captures(query: string, node = this.rootNode) : T.QueryCapture[] {
        return this.language.query(query).captures(node);
    }
    // filter(
    //     captures: T.QueryCapture[], tag: Tag | null = null,
    // ): T.QueryCapture[] {
    //     return !tag ? captures : captures.filter(item => item.name === tag);
    // }

    async setLanguage(id: string, folderPath: string) {
        this.langData = find(id);
        let path = this.getPath(id, folderPath);

        this.language = await T.Language.load(path);
        this.parser.setLanguage(this.language);
    }
    parse(text: string) {
        this.rootNode = this.parser.parse(text).rootNode;
    }

    private getPath(languageId: string, folderPath: string) {
        const parserPath = `${folderPath}\\tree-sitter-${languageId}.wasm`;
        nullCheck(
            files.existsSync(parserPath),
            `No parser for '${languageId}' located!`,
        );
        return parserPath;
    }
}
