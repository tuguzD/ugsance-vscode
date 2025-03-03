import { QueryItem } from "../queries/model";

type I = QueryItem[];
export type Language = {
    vscodeId: string,
    jump: I,
    loop: I, flow: I,
    callUnit: I,
};
