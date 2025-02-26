import * as vscode from 'vscode';

export function register(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('UGsance.DefinitionProvider', DefinitionProvider),
		vscode.commands.registerCommand('UGsance.TypeDefinitionProvider', TypeDefinitionProvider),
		vscode.commands.registerCommand('UGsance.DeclarationProvider', DeclarationProvider),
		vscode.commands.registerCommand('UGsance.ImplementationProvider', ImplementationProvider),
		vscode.commands.registerCommand('UGsance.ReferenceProvider', ReferenceProvider),
	);
}

function DefinitionProvider() {
	executeFeatureProvider(vscode.window.activeTextEditor, 'vscode.executeDefinitionProvider');
}

function TypeDefinitionProvider() {
	executeFeatureProvider(vscode.window.activeTextEditor, 'vscode.executeTypeDefinitionProvider');
}

function DeclarationProvider() {
	executeFeatureProvider(vscode.window.activeTextEditor, 'vscode.executeDeclarationProvider');
}

function ImplementationProvider() {
	executeFeatureProvider(vscode.window.activeTextEditor, 'vscode.executeImplementationProvider');
}

function ReferenceProvider() {
	executeFeatureProvider(vscode.window.activeTextEditor, 'vscode.executeReferenceProvider')
}

async function executeFeatureProvider(editor: vscode.TextEditor | undefined, command: string) {
	if (!editor) {
		console.log("No file opened!");
		return;
	}
	const locations: vscode.Location[] = await
		vscode.commands.executeCommand<vscode.Location[] | vscode.LocationLink[]>(
			command, editor.document.uri, editor.selection.active,
		).then(locations => locations.map(
			item => item instanceof vscode.Location ? item
				: new vscode.Location(item.targetUri, item.targetRange))
		);
	console.log('\n', `Command '${command}' was successfully called`);
	console.log(locations);

	const rangeOutput: string[] = locations.map(item =>
		`Line: ${item.range.start.line.toString()} + ` +
		`Char: ${item.range.start.character.toString()}`
	);
	vscode.window.showInformationMessage(rangeOutput.toString());
	console.log(rangeOutput);
}
