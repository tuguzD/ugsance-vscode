import { QueryItem } from "../model";
import { Tag } from "../tag";

export type Block = {
    item: Tag, body: Tag,
};

function item(tag: Block, type: Block) {
    return new QueryItem(tag.item, type.item, [
        new QueryItem(tag.body, type.body),
    ]);
}

export function items(tag: Block, typeCommon: string, types: string[]) {
    return types.map(type =>
        item(tag, { item: type, body: typeCommon })
    );
}
