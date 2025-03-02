import { QueryItem } from "../model";
import { Tag, tags } from "../tag";

export type CallUnit = {
    unit: Tag, body: Tag,
    name: Tag | null, args: Tag,
};

export function queryItem(type: CallUnit) {
    let children: QueryItem[] = type.name ? [
        new QueryItem(tags.unit.name, type.name),
    ] : [];

    children.push(
        new QueryItem(tags.unit.args, type.args),
        new QueryItem(tags.unit.body, type.body),
    );

    return new QueryItem(
        tags.unit.unit, type.unit, children
    );
}
