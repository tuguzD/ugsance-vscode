import { QueryItem } from ".";

type CallUnit = {
    unit: string, body: string,
    name: string | null, args: string,
};
export const tag: CallUnit = {
    unit: 'unit', body: 'body',
    name: 'name', args: 'args',
};

export function queryItem(type: CallUnit) {
    let children: QueryItem[] = type.name ? [
        new QueryItem(tag.name, type.name),
    ] : [];

    children.push(
        new QueryItem(tag.args, type.args),
        new QueryItem(tag.body, type.body),
    );

    return new QueryItem(
        tag.unit, type.unit, children
    );
}
