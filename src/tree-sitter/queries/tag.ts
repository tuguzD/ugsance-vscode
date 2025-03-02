import { CallUnit } from "./items/call-unit";
import { Loop } from "./items/loop";
import { Flow } from "./items/flow";

export type Tag = string;

type TagItem = {
    unit: CallUnit, jump: Tag,
    loop: Loop, flow: Flow,
};
export const tags: TagItem = {
    unit: {
        unit: 'unit', body: 'body',
        name: 'name', args: 'args',
    },
    loop: {
        loop: 'loop', body: 'body',
    },
    flow: {
        flow: 'flow', body: 'body',
    },
    jump: 'jump',
};
