import * as vs from 'vscode';

export async function executeFeatureProvider(editor: vs.TextEditor, command: string) {
    type Locations = vs.Location[] | vs.LocationLink[];
    return await vs.commands.executeCommand<Locations>(
        command, editor.document.uri, editor.selection.active,
    ).then(locations => locations.map(
        item => item instanceof vs.Location ? item
            : new vs.Location(item.targetUri, item.targetRange))
    );
}
