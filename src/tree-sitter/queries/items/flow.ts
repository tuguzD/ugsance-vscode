import { Alternation, QueryItem } from "../model";
import { Block } from "./block";
import { tags } from "../tag";

export function items(
    tag: Block, types: string[],
    clauses: string[], typeBody: string,
): QueryItem[] {
    let body = new QueryItem(tags.flow.body, typeBody);
    let group = clauses.map(clause =>
        new QueryItem(tags.flow.item, clause, [body]),
    );

    return types.map(type =>
        new QueryItem(tag.item, type, [
            new Alternation(null, [body].concat(group)),
        ]),
    );
}
