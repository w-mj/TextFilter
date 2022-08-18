import * as vscode from 'vscode';

export class EntryItem extends vscode.TreeItem {

}

export class EntryList implements vscode.TreeDataProvider<EntryItem> {
    onDidChangeTreeData?: vscode.Event<void | EntryItem | EntryItem[] | null | undefined> | undefined;

    getTreeItem(element: EntryItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: EntryItem | undefined): vscode.ProviderResult<EntryItem[]> {
        return [
            new EntryItem("1",vscode.TreeItemCollapsibleState.None),
            new EntryItem("2",vscode.TreeItemCollapsibleState.None),
            new EntryItem("3",vscode.TreeItemCollapsibleState.None),
        ];
    }

}