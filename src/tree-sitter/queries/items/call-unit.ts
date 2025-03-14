import { QueryItem } from "../model";
import { Tag, tags } from "..";
import { Block } from "./block";

export type CallUnit = Block & {
    name: Tag | null, args: Tag,
};

export function item(type: CallUnit) {
    let children: QueryItem[] = type.name ? [
        new QueryItem(tags.unit.name, type.name),
    ] : [];

    children.push(
        new QueryItem(tags.unit.args, type.args),
        new QueryItem(tags.unit.body, type.body!),
    );

    return new QueryItem(
        tags.unit.item, type.item, children
    );
}
