import * as vscode from 'vscode';
import { FilterItemMode, regexRules } from './panel';

class FilterDocument {
    private readonly originUri;
    constructor(uri: vscode.Uri) {
        this.originUri = uri;
    }

    getText(): Thenable<string> {
        return new Promise((resolve, reject)=>{
            const regs = regexRules.all();
            let buffer: string[] = [];
            vscode.workspace.openTextDocument(this.originUri).then(doc=>{
                for (let i = 0; i < doc.lineCount; i++) {
                    const line = doc.lineAt(i);
                    let j = 0;
                    for (j = 0; j < regs.length; j++) {
                        const item = regs[j];
                        const r = item.getRegex();
                        const mode = item.getMode();
                        if (mode === FilterItemMode.None || !r) {
                            continue;
                        }
                        if (r.test(line.text)) {
                            switch(mode) {
                                case FilterItemMode.Hide:
                                    break;
                                case FilterItemMode.Highlight:
                                    buffer.push(line.text);
                                    break;
                            };
                            break;  // 仅匹配第一个规则
                        }
                    }
                    if (j === regs.length) {
                        // 未匹配到，默认显示
                        buffer.push(line.text);
                    }
                }
                resolve(buffer.join('\n'));
            }, reject);
        });
    }
}


export default class Provider implements vscode.TextDocumentContentProvider, vscode.DocumentLinkProvider {
    provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
        throw new Error('Method not implemented.');
    }

    static scheme = 'logviewer';

    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    onDidChange: vscode.Event<vscode.Uri> = this._onDidChange.event;

    private _documents = new Map<string, FilterDocument>;

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
        const originUri = vscode.Uri.parse(uri.path);
        let doc = this._documents.get(uri.toString());
        if (!doc) {
            doc = new FilterDocument(originUri);
            this._documents.set(uri.toString(), doc);
        }
        return doc.getText();
    }

    update(uri: vscode.Uri | undefined) {
        if (uri) {
            this._onDidChange.fire(uri);
        } else {
            for (let key of this._documents) {
                this._onDidChange.fire(vscode.Uri.parse(key[0]));
            }
        }
    }
    
    dispose() {
        this._documents.clear();
    }

}
