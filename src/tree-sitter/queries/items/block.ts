import { QueryItem } from "../model";
import { Tag } from "..";

export type Block = {
    item: Tag,
    body: Tag | null,
};

function item(tag: Block, type: Block): QueryItem {
    return new QueryItem({
        tag: tag.item, type: type.item,
        children: type.body ? [new QueryItem({ tag: tag.body, type: type.body })] : []
    });
}

export function items(
    tag: Block, types: string[],
    typeCommon: string | null = null,
) {
    return types.map(type =>
        item(tag, { item: type, body: typeCommon })
    );
}
