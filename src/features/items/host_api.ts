import * as vs from 'vscode';

import { Configuration } from '../../vscode/commands/model';
import * as cmd from '../../vscode/commands';
import { Parser } from '../../tree-sitter/parsers/model';

import { MultiStepInput } from '../../vscode/inputs/model';
import { executeFeatureProvider, checkEditor } from '..';

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

    confirm(state);
}

async function confirm(state: Partial<APIState>) {
    const amount = (await executeFeatureProvider(
        state.editor!, cmd.name(cmd.vsCommand.references)
    )).length;
    const callName = state.callItem!.label.split('(')[0];
    const detail = [
        `Do you really want to provide chosen call unit (${callName}) for mods?`,
        (amount > 0 ? `It's used by your code in exactly ${amount} places!` : '')
    ].filter(i => i !== '').join('\n');
    const confirmOption = 'Yes';

    const choice = await vs.window.showInformationMessage(
        state.title!, { detail, modal: true }, confirmOption);
    if (choice !== confirmOption) { return; }

    vs.window.showInformationMessage(
        'Host function (mod API call) generated!');
}
