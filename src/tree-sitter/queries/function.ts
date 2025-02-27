import { QueryItem } from ".";

type Function = {
    fun: string, body: string,
    name: string, args: string,
};
export const tag: Function = {
    fun: 'function', body: 'body',
    name: 'name', args: 'args',
};
export function queryItem(type: Function) {
    return new QueryItem(tag.fun, type.fun, [
        new QueryItem(tag.name, type.name),
        new QueryItem(tag.args, type.args),
        new QueryItem(tag.body, type.body),
    ]);
}
