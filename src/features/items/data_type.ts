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
        title: "New mod data, or existing type's info",
        editor, parser,
    };
    // console.log(parser.language.type.str);
    await MultiStepInput.run(input => pickType(input, state));
}

// TODO: first step (pick a type from file)
async function pickType(input: MultiStepInput, state: Partial<DataState>) {
    await input.showQuickPick<QuickPickNode>({
        title: state.title, step: 1, totalSteps: 999,
        items: [],
    });
    // return (input: MultiStepInput) => ...(input, state);
}
