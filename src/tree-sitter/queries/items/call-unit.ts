import { QueryItem } from "../model";
import { Tag, tags } from "..";
import { Block } from "./block";

export type Call = Block & {
    name: Tag | null,
    args: Tag,
};

export function item(type: Call) {
    let children: QueryItem[] = type.name ? [
        new QueryItem({ tag: tags.call.name, type: type.name }),
    ] : [];

    children.push(
        new QueryItem({ tag: tags.call.args, type: type.args }),
        new QueryItem({ tag: tags.call.body, type: type.body! }),
    );

    return new QueryItem({
        tag: tags.call.item, type: type.item, children
    });
}
