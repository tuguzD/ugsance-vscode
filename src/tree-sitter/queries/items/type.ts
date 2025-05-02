import { Tag } from "..";
import { Block } from "./block";

export type Type = Block & {
    name: Tag,
}
