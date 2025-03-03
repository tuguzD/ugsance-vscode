import { QueryItem, QueryItems } from "../../queries/model";

export function items(query: QueryItem[]) {
    return new QueryItems(query);
}
