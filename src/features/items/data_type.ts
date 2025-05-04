import { Configuration } from '../../vscode/commands/model';
import { Parser } from '../../tree-sitter/parsers/model';

import { MultiStepInput } from '../../vscode/inputs/model';

import { checkEditor } from '..';
import { QuickPickNode, State } from '../model';

interface DataState extends State { }

export async function launch(parser: Parser, config: Configuration) {
    const editor = await checkEditor(parser, config);
    if (!editor) { return; }

    let state: Partial<DataState> = {
        step: 0, totalSteps: 2,
        title: "New mod data, or existing type's info",
        editor, parser,
    };
    // console.log(parser.language.type.str);
    await MultiStepInput.run(input => pickType(input, state));
}

// TODO: first step (pick a type from file)
async function pickType(input: MultiStepInput, state: Partial<DataState>) {
    state.step = 1;
    await input.showQuickPick<QuickPickNode>({
        step: state.step, totalSteps: state.totalSteps,
        title: state.title, items: [],
    });
    // return (input: MultiStepInput) => ...(input, state);
}
