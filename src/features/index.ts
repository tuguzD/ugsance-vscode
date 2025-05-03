import * as vs from 'vscode';
import * as util from '../utils';

import { Parser } from '../tree-sitter/parsers/model';
import * as cmd from '../vscode/commands';
import { Configuration } from '../vscode/commands/model';

import * as event from './items/event';
import * as api from './items/host_api';
import * as type from './items/data_type';

export function register(context: vs.ExtensionContext, parser: Parser, config: Configuration) {
    context.subscriptions.push(
        vs.commands.registerCommand(
            cmd.name(cmd.Command.new_host_api),
            () => { api.launch(parser, config); }
        ),
        vs.commands.registerCommand(
            cmd.name(cmd.Command.new_data_type),
            () => { type.launch(parser, config); }
        ),
        vs.commands.registerCommand(
            cmd.name(cmd.Command.new_event),
            () => { event.launch(parser, config); }
        ),
    );
}

export async function checkEditor(parser: Parser, config: Configuration): Promise<vs.TextEditor | null> {
    const editor = vs.window.activeTextEditor;
    try {
        util.nullCheck(editor, `No text editor opened!`);
        await parser.setLanguage(
            editor.document.languageId, config.userFolder);
        parser.parse(editor.document.getText());
    } catch (e: any) {
        vs.window.showErrorMessage(e.message);
        console.log(e.message);
        return null;
    }
    return editor;
}

export async function executeFeatureProvider(editor: vs.TextEditor, command: string) {
    type Locations = vs.Location[] | vs.LocationLink[];
    return await vs.commands.executeCommand<Locations>(
        command, editor.document.uri, editor.selection.active,
    ).then(locations => locations.map(
        item => item instanceof vs.Location ? item
            : new vs.Location(item.targetUri, item.targetRange))
    );
}
