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

export async function executeFeatureProvider(editor: vs.TextEditor, command: string) {
	type Locations = vs.Location[] | vs.LocationLink[];
	return await vs.commands.executeCommand<Locations>(
		command, editor.document.uri, editor.selection.active,
	).then(locations => locations.map(
		item => item instanceof vs.Location ? item
			: new vs.Location(item.targetUri, item.targetRange))
	);
}

function DefinitionProvider() {
	testCommand(vs.window.activeTextEditor, name(vsCommand.definitions));
}

function TypeDefinitionProvider() {
	testCommand(vs.window.activeTextEditor, name(vsCommand.typeDefinitions));
}

function DeclarationProvider() {
	testCommand(vs.window.activeTextEditor, name(vsCommand.declarations));
}

function ImplementationProvider() {
	testCommand(vs.window.activeTextEditor, name(vsCommand.implementations));
}

function ReferenceProvider() {
	testCommand(vs.window.activeTextEditor, name(vsCommand.references));
}

async function testCommand(editor: vs.TextEditor | undefined, command: string) {
	if (!editor) {
		console.log("No file opened!");
		return;
	}
	const locations = await executeFeatureProvider(editor, command);
	console.log('\n', `Command '${command}' was successfully called`);
	console.log(locations);
	const rangeOutput: string[] = locations.map(item =>
		`Line: ${item.range.start.line.toString()} + ` +
		`Char: ${item.range.start.character.toString()}`
	);
	vs.window.showInformationMessage(rangeOutput.toString());
	console.log(rangeOutput);
}
