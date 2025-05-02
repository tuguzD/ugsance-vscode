import { Tag } from "..";
import { Block } from "./block";

export type Data = Block & {
    name: Tag, type: Tag,
}
