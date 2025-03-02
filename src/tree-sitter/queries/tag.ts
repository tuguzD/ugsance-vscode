import { CallUnit } from "./items/call-unit";
import { Block } from "./items/block";

export type Tag = string;

type TagItem = {
    unit: CallUnit, jump: Tag,
    loop: Block, flow: Block,
};
export const tags: TagItem = {
    unit: {
        item: 'unit', body: 'body',
        name: 'name', args: 'args',
    },
    loop: {
        item: 'loop', body: 'body',
    },
    flow: {
        item: 'flow', body: 'body',
    },
    jump: 'jump',
};
