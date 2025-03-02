import { Alternation, QueryItem } from "../model";
import { Block } from "./block";
import { tags } from "../tag";

export function items(
    tag: Block, types: string[],
    clauses: string[], typeBody: string,
    alternation = true, body = true,
    tagged = true, repeated = false,
): QueryItem[] {
    let item = new QueryItem(tags.flow.body, typeBody);
    let group = clauses.map(clause => new QueryItem(
        tagged ? tags.flow.item : null,
        clause, [item], false, repeated,
    ));
    let child = body ? [item].concat(group) : group;

    return types.map(type =>
        new QueryItem(tag.item, type, 
            alternation ? [new Alternation(null, child)] : child,
        ),
    );
}
