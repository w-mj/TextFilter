import { utils } from 'mocha';
import * as vscode from 'vscode';


export default class Provider implements vscode.TextDocumentContentProvider, vscode.DocumentLinkProvider {
    provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
        throw new Error('Method not implemented.');
    }

    static scheme = 'logviewer';

    onDidChange?: vscode.Event<vscode.Uri> | undefined;

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
        return uri.path;
    }
    
    dispose() {}

}
