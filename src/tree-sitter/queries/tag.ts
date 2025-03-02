import { CallUnit } from "./call-unit";

export type Tag = string;

type TagItem = {
    unit: CallUnit, jump: Tag,
};
export const tags: TagItem = {
    unit: {
        unit: 'unit', body: 'body',
        name: 'name', args: 'args',
    },
    jump: 'jump',
};
