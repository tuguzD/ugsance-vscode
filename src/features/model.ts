import * as vs from 'vscode';

import * as T from 'web-tree-sitter';
import * as t from '../tree-sitter/parsers/model';

export interface QuickPickNode extends vs.QuickPickItem {
    node: T.SyntaxNode, type?: string,
}

export interface State {
    title: string, 
    step: number, totalSteps: number,
    parser: t.Parser, editor: vs.TextEditor,
}
