import * as vscode from 'vscode';

export function register(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('ugsance.references', getReferences),
		// other commands
	);
}

function getReferences() {
	let editor = vscode.window.activeTextEditor;
	if (!editor) {
		console.log("No file opened!");
		return;
	}

	executeReferenceProvider(editor);
}

async function executeReferenceProvider(editor: vscode.TextEditor) {
	const refs = await vscode.commands.executeCommand<vscode.Location[]>(
		'vscode.executeReferenceProvider',
		editor.document.uri, editor.selection.active,
	);

	var result: string[] = [];
	for (var ref of refs) result.push(
		`Line: ${ref.range.start.line.toString()} + ` +
		`Char: ${ref.range.start.character.toString()}`
	);
	vscode.window.showInformationMessage(result.toString());

	// for (const ref of refs) console.log(ref.range.start);
	console.log(result);
}
