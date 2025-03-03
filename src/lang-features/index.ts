import * as vs from 'vscode';
import { name, Command, vsCommand } from '../command';

export function register(context: vs.ExtensionContext) {
	context.subscriptions.push(
		vs.commands.registerCommand(name(Command.definitions), DefinitionProvider),
		vs.commands.registerCommand(name(Command.typeDefinitions), TypeDefinitionProvider),
		vs.commands.registerCommand(name(Command.declarations), DeclarationProvider),
		vs.commands.registerCommand(name(Command.implementations), ImplementationProvider),
		vs.commands.registerCommand(name(Command.references), ReferenceProvider),
	);
}

function DefinitionProvider() {
	executeFeatureProvider(vs.window.activeTextEditor, name(vsCommand.definitions));
}

function TypeDefinitionProvider() {
	executeFeatureProvider(vs.window.activeTextEditor, name(vsCommand.typeDefinitions));
}

function DeclarationProvider() {
	executeFeatureProvider(vs.window.activeTextEditor, name(vsCommand.declarations));
}

function ImplementationProvider() {
	executeFeatureProvider(vs.window.activeTextEditor, name(vsCommand.implementations));
}

function ReferenceProvider() {
	executeFeatureProvider(vs.window.activeTextEditor, name(vsCommand.references));
}

async function executeFeatureProvider(editor: vs.TextEditor | undefined, command: string) {
	if (!editor) {
		console.log("No file opened!");
		return;
	}
	type Locations = vs.Location[] | vs.LocationLink[];
	const locations: vs.Location[] = await vs.commands.executeCommand<Locations>(
		command, editor.document.uri, editor.selection.active,
	).then(locations => locations.map(
		item => item instanceof vs.Location ? item
			: new vs.Location(item.targetUri, item.targetRange))
	);
	console.log('\n', `Command '${command}' was successfully called`);
	console.log(locations);

	const rangeOutput: string[] = locations.map(item =>
		`Line: ${item.range.start.line.toString()} + ` +
		`Char: ${item.range.start.character.toString()}`
	);
	vs.window.showInformationMessage(rangeOutput.toString());
	console.log(rangeOutput);
}
