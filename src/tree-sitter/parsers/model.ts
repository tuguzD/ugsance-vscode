import T from "web-tree-sitter";
import * as files from 'fs';
import { nullCheck } from "../../utils";

import { find } from "../languages";
import { Language } from "../languages/model";

// import { Tag } from "../queries/tag";

// export class QueryCaptures {
//     list: T.QueryCapture[];
//     constructor(capture: T.QueryCapture[]) {
//         this.list = capture;
//     }
//     filter(tag: Tag | null = null): QueryCaptures {
//         return !tag ? this : new QueryCaptures(
//             this.list.filter(item => item.name === tag)
//         );
//     }
// }

export class Parser {
    private parser: T = new T();
    language!: T.Language;

    rootNode!: T.SyntaxNode;
    langData!: Language;

    captures(query: string, node = this.rootNode): T.QueryCapture[] {
        return this.language.query(query).captures(node);
    }

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
