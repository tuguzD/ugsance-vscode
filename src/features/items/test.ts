import * as vs from 'vscode';
import { name, Command, vsCommand } from '../../vscode/commands';
import { executeFeatureProvider } from '..';

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
