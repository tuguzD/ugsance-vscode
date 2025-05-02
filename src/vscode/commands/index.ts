import { UGsance } from "./model";
const VSCode = 'vscode';

export enum Command {
    new_event = 'new_event',
    new_host_api = 'new_host_api',
    new_data_type = 'new_data_type',
    // Tests
    definitions = 'DefinitionProvider',
    typeDefinitions = 'TypeDefinitionProvider',
    declarations = 'DeclarationProvider',
    implementations = 'ImplementationProvider',
    references = 'ReferenceProvider',
}
export enum vsCommand {
    definitions = 'executeDefinitionProvider',
    typeDefinitions = 'executeTypeDefinitionProvider',
    declarations = 'executeDeclarationProvider',
    implementations = 'executeImplementationProvider',
    references = 'executeReferenceProvider',
}

type command = Command | vsCommand;
export function name(command: command, extension: string = UGsance) {
    extension = Object.values(vsCommand).includes(command as vsCommand)
        ? VSCode : extension;
    return `${extension}.${command}`;
}
