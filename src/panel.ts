import * as vscode from 'vscode';

export class EntryItem extends vscode.TreeItem {
    constructor(regex: string) {
        super(regex, vscode.TreeItemCollapsibleState.None);
    }

    getRegex(): string {
        if (this.label && typeof this.label === 'string') {
            return this.label as string;
        } else if (this.label) {
            return (this.label as vscode.TreeItemLabel).label;
        }
        return "";
    }

    setRegex(regex: string) {
        this.label = regex;
    }
}

export class EntryList implements vscode.TreeDataProvider<EntryItem> {


    private regexList: EntryItem[] = [];

    private _onDidChangeTreeData: vscode.EventEmitter<EntryItem | undefined> = new vscode.EventEmitter<EntryItem | undefined>();
    readonly onDidChangeTreeData?: vscode.Event<EntryItem | undefined> = this._onDidChangeTreeData.event;

    getTreeItem(element: EntryItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: EntryItem | undefined): vscode.ProviderResult<EntryItem[]> {
        return this.regexList;
    }

    add(regex: string) {
        this.regexList.push(new EntryItem(regex));
        this._onDidChangeTreeData.fire(undefined);
    }

	remove(item: EntryItem) {
        for (var i = 0; i < this.regexList.length; i++) {
            if (this.regexList[i] === item) {
                this.regexList.splice(i, 1);
                this._onDidChangeTreeData.fire(undefined);
                return;
            }
        }
	}

	update(item: EntryItem) {
        this._onDidChangeTreeData.fire(item);
	}
}