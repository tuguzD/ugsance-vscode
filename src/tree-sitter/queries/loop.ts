import { QueryItem } from ".";
import { Tag, tags } from "./tag";

export type Loop = {
    loop: Tag, body: Tag,
};

export function queryItem(type: Loop) {
    return new QueryItem(tags.loop.loop, type.loop, [
        new QueryItem(tags.loop.body, type.body),
    ]);
}

export function queryItems(typeCommon: string, types: string[]): QueryItem[] {
    return types.map(type => 
        queryItem({loop: type, body: typeCommon})
    );
}
