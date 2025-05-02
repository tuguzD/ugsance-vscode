import { QueryItems as I } from "../queries/model";

export type Language = {
    vscodeId: string,
    type: I, type_data: I,
    call: I, call_data: I,
    jump: I, loop: I, flow: I,
};
