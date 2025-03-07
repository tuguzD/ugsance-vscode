import * as vs from 'vscode';
import { nullCheck } from '../../utils';

export const UGsance = 'UGsance';

export class Configuration {
    private _source: vs.WorkspaceConfiguration;
    constructor() {
        this._source = vs.workspace.getConfiguration(UGsance);
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
