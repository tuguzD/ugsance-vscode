import { QueryItem } from ".";

type CallUnit = {
    call: string, body: string,
    name: string | null, args: string,
};
export const tag: CallUnit = {
    call: 'callable', body: 'body',
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
        tag.call, type.call, children
    );
}
