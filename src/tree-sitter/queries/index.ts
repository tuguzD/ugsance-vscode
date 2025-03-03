import T from "web-tree-sitter";
import { Tag } from "./tag";
import { QueryItem } from "./model";

// export const pog = (item: T.QueryCapture, tag: Tag) => (item.name === tag);

export function filter(
    captures: T.QueryCapture[], tag: Tag | null = null,
): T.QueryCapture[] {
    return !tag ? captures : captures.filter(item => item.name === tag);
}

export function build(queryType: QueryItem[]): string {
    return queryType.map(item => item.query).join('\n\n');
}
