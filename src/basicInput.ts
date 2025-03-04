import * as vs from 'vscode';

export async function showQuickPick() {
    let i = 0;
    const result = await vs.window.showQuickPick(['one', 'two', 'three'], {
        placeHolder: 'one, two or three',
        onDidSelectItem: item => vs.window.showInformationMessage(`Focus ${++i}: ${item}`)
    });
    vs.window.showInformationMessage(`Got: ${result}`);
}

export async function showInputBox() {
    const result = await vs.window.showInputBox({
        value: 'abcdef',
        valueSelection: [2, 4],
        placeHolder: 'For example: something. But not: 123',
        validateInput: text => {
            vs.window.showInformationMessage(`Validating: ${text}`);
            return text === '123' ? 'Not 123!' : null;
        }
    });
    vs.window.showInformationMessage(`Got: ${result}`);
}
