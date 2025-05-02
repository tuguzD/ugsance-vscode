import * as vs from 'vscode';
import * as T from 'web-tree-sitter';

export interface QuickPickNode extends vs.QuickPickItem {
    node: T.SyntaxNode,
    type?: string,
}

export interface State {
    title: string,
    step: number,
    totalSteps: number,
}
