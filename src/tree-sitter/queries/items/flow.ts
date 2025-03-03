import { Alternation, QueryItem } from "../model";
import { Block } from "./block";
import { tags } from "..";

export function items(
    tag: Block, types: string[],
    clauses: string[], typeBody: string,
    alternation = true, bodyFirst = true,
    tagged = true, repeated = false, bodyNest = true,
): QueryItem[] {
    let body = new QueryItem(tags.flow.body, typeBody);
    let item = tagged ? tags.flow.item : null;
    let group = clauses.map(clause => new QueryItem(
        bodyNest ? item : tags.flow.body, clause,
        bodyNest ? [body] : [], false, repeated,
    ));
    let child = bodyFirst ? [body].concat(group) : group;

    return types.map(type =>
        new QueryItem(tag.item, type,
            alternation ? [new Alternation(null, child)] : child,
        ),
    );
}
