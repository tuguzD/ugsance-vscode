import { QueryItem } from "../model";
import { Tag, tags } from "..";
import { Block } from "./block";

export type CallUnit = Block & {
    name: Tag | null,
    args: Tag,
};

export function item(type: CallUnit) {
    let children: QueryItem[] = type.name ? [
        new QueryItem({ tag: tags.unit.name, type: type.name }),
    ] : [];

    children.push(
        new QueryItem({ tag: tags.unit.args, type: type.args }),
        new QueryItem({ tag: tags.unit.body, type: type.body! }),
    );

    return new QueryItem({
        tag: tags.unit.item, type: type.item, children
    });
}
