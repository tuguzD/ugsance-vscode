import T from "web-tree-sitter";
import * as files from 'fs';
import { nullCheck } from "../../utils";

import * as language from "../languages";
import { Language } from "../languages/model";

import { Tag } from "../queries";

export class QueryCaptures {
    list: T.QueryCapture[];
    constructor(capture: T.QueryCapture[]) {
        this.list = capture;
    }

    get nodes() {
        return this.list.map(item => item.node);
    }
    get nodesText() {
        return this.list.map(item => item.node.text);
    }

    filter(tags: Tag[]): QueryCaptures {
        return new QueryCaptures(tags.map(tag =>
            this.list.filter(item => item.name === tag)
        ).flat());
    }
}

export class Parser {
    private parser: T = new T();
    private _lang_!: T.Language;

    rootNode!: T.SyntaxNode;
    language!: Language;

    parse(text: string) {
        this.rootNode = this.parser.parse(text).rootNode;
    }
    captures(query: string, node = this.rootNode) {
        return new QueryCaptures(
            this._lang_.query(query).captures(node)
        );
    }

    async setLanguage(id: string, folderPath: string) {
        this.language = language.find(id);
        let path = this.getPath(id, folderPath);

        this._lang_ = await T.Language.load(path);
        this.parser.setLanguage(this._lang_);
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
