import * as vs from 'vscode';

export async function cursorJump(
	editor: vs.TextEditor, line: number,
	character: number, offset: number,
) {
	const position = new vs.Position(line + 1, character);
	editor.selection = new vs.Selection(position, position);
	await vs.commands.executeCommand('cursorMove', { to: 'up' });

	editor.selection = new vs.Selection(
		new vs.Position(line, character),
		new vs.Position(line, character + offset),
	);
}
