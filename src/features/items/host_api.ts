
import { Configuration } from '../../vscode/commands/model';
import { Parser } from '../../tree-sitter/parsers/model';

import { MultiStepInput } from '../../vscode/inputs/model';
import { checkEditor } from '..';

import * as call from '../utils/call';

interface APIState extends call.State { }

export async function launch(parser: Parser, config: Configuration) {
    const editor = await checkEditor(parser, config);
    if (!editor) { return; }

    let state: Partial<APIState> = {
        title: 'New host function, or mod API call',
        editor, parser,
    };
    // console.log(parser.language.type.str);
    await MultiStepInput.run(input => pickCall(input, state));
}

async function pickCall(input: MultiStepInput, state: Partial<APIState>) {
    await call.pick(input, state,
        `Select a "call unit" that'll be called by any mod`,
    );
    // TODO: next step (pick arguments to pass)
    // return (input: MultiStepInput) => ...(input, state);
}
