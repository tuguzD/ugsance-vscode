import { Alternation, QueryItem } from "../model";
import { Block } from "./block";
import { tags } from "..";

export function items(
    tag: Block, types: string[],
    clauses: string[], typeBody: string,
    alternation = true, bodyFirst = true,
    tagged = true, repeat = false, bodyNest = true,
): QueryItem[] {
    let body = new QueryItem({ tag: tags.flow.body, type: typeBody });
    let item = tagged ? tags.flow.item : null;
    let group = clauses.map(clause => new QueryItem({
        tag: bodyNest ? item : tags.flow.body, type: clause,
        children: bodyNest ? [body] : [], option: false, repeat,
    }));
    let children = bodyFirst ? [body].concat(group) : group;

    return types.map(type =>
        new QueryItem({
            tag: tag.item, type,
            children: alternation ? [new Alternation({ children })] : children,
        }),
    );
}
