import { QueryItem } from "../model";
import { Tag } from "../tag";

export type Block = {
    item: Tag,
    body: Tag | null,
};

function item(tag: Block, type: Block): QueryItem {
    return new QueryItem(tag.item, type.item,
        type.body ? [new QueryItem(tag.body, type.body)] : []
    );
}

export function items(
    tag: Block, types: string[],
    typeCommon: string | null = null,
) {
    return types.map(type =>
        item(tag, { item: type, body: typeCommon })
    );
}
