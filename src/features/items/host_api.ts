
import { Configuration } from '../../vscode/commands/model';
import { Parser } from '../../tree-sitter/parsers/model';

import { MultiStepInput } from '../../vscode/inputs/model';
import { checkEditor } from '..';

import * as call from '../utils/call';
import * as data from '../utils/call_data';

interface APIState extends call.State, data.State { }

export async function launch(parser: Parser, config: Configuration) {
    const editor = await checkEditor(parser, config);
    if (!editor) { return; }

    let state: Partial<APIState> = {
        step: 0, totalSteps: 2,
        title: 'New host function, or mod API call',
        editor, parser,
    };
    // console.log(parser.language.type.str);
    await MultiStepInput.run(input => pickCall(input, state));
}

async function pickCall(input: MultiStepInput, state: Partial<APIState>) {
    state.step = 1;
    await call.pick(input, state,
        `Select a "call unit" that'll be called by any mod`,
    );
    return (input: MultiStepInput) => pickArg(input, state);
}

async function pickArg(input: MultiStepInput, state: Partial<APIState>) {
    state.step = 2;
    await data.pick(input, state, state.callArgs!,
        `Select an argument that'll be provided by a mod`,
    );
    // TODO: next step (confirm host API creation)
}
