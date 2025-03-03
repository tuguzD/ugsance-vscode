import T from "web-tree-sitter";
import { Tag } from "./tag";

export function filter(
    captures: T.QueryCapture[], tag: Tag | null = null,
): T.QueryCapture[] {
    return !tag ? captures : captures.filter(item => item.name === tag);
}
