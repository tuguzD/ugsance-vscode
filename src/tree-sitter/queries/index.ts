import { Call } from "./items/call";
import { Type } from "./items/type";
import { Data } from "./items/data";
import { Block } from "./items/block";

export type Tag = string;
type TagItem = {
    call: Call, type: Type, data: Data,
    jump: Block, loop: Block, flow: Block,
};

const body = 'body';
export const tags: TagItem = {
    call: {
        item: 'unit', body: body,
        name: 'name', args: 'args',
    },
    type: {
        item: 'type', body: body,
        name: 'name',
    },
    data: {
        item: 'data', body: null,
        name: 'name', type: 'type',
    },
    loop: {
        item: 'loop', body: body,
    },
    flow: {
        item: 'flow', body: body,
    },
    jump: {
        item: 'jump', body: null,
    },
};
