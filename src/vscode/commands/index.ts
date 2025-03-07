import { UGsance } from "./model";
const VSCode = 'vscode';

export enum Command {
    definitions = 'DefinitionProvider',
    typeDefinitions = 'TypeDefinitionProvider',
    declarations = 'DeclarationProvider',
    implementations = 'ImplementationProvider',
    references = 'ReferenceProvider',
    TreeSitter = 'tree_sitter',
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
