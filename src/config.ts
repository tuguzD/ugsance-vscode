import * as vscode from 'vscode';
import { nullCheck } from './utils';

export class Configuration {
    private _source: vscode.WorkspaceConfiguration;
    constructor() {
        this._source = vscode.workspace.getConfiguration('UGsance');
        this._userFolder = this._source.get<string>('tree-sitter.pathToWASM')!;
    }

    private _userFolder: string;
    get userFolder() {
        nullCheck(
            this._userFolder.trim() !== '',
            `You should set up folder for parsers (WASM files)!`,
        );
        return this._userFolder;
    }
}
