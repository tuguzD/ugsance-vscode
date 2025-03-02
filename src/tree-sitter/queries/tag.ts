import { CallUnit } from "./call-unit";
import { Loop } from "./loop";
import { Flow } from "./flow";

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
