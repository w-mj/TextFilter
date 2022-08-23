import path = require('path');
import * as vscode from 'vscode';

export enum FilterItemMode {
    Highlight = 0,
    Hide,
    None
}

class FilterItemLabel implements vscode.TreeItemLabel {
    label: string;
    highlights?: [number, number][] | undefined;
    constructor(label: string) {
        this.label = label;
        this.highlights = [[0, label.length]];
    }
}

class FilterItemCommand implements vscode.Command {
    title: string;
    command: string;
    tooltip?: string | undefined;
    arguments?: any[] | undefined;
    constructor(item: FilterItem) {
        this.title = "Change Mode";
        this.command = "logviewer.change-mode";
        this.tooltip = "Change Mode";
        this.arguments = [item];
    }
}
    
export class FilterItem extends vscode.TreeItem {
    private mode: FilterItemMode = FilterItemMode.None;
    private reg?: RegExp = undefined;
    constructor(regex: string, mode: FilterItemMode=FilterItemMode.None) {
        super(regex, vscode.TreeItemCollapsibleState.None);
        this.command = new FilterItemCommand(this);
        this.setMode(mode);
        this.setRegex(regex);
    }


    getRegexString(): string {
        if (this.label && typeof this.label === 'string') {
            return this.label as string;
        } else if (this.label) {
            return (this.label as vscode.TreeItemLabel).label;
        }
        return "";
    }

    setRegex(regex: string) {
        try {
            this.reg = new RegExp(regex);
            this.label = regex;
        } catch(e) {
            this.reg = undefined;
            this.label = new FilterItemLabel(regex);
        }
    }

    getMode() {
        if (this.reg === undefined) {
            return FilterItemMode.None;
        }
        return this.mode;
    }

    setMode(mode: FilterItemMode) {
        this.mode = mode;
        const iconPaths = [
            "resources/sun.svg",
            "resources/eye-slash.svg",
            "resources/cross-23.svg"
        ];
        this.iconPath = path.join(__filename, "../..", iconPaths[this.mode]);
    }

    getRegex() {
        return this.reg;
    }

	changeMode() {
        this.setMode((this.mode as number + 1) % 3);
	}

    static build(data: any) {
        return new FilterItem(data['regex'], data['mode']);
    }

    toJSON() {
        return {
            regex: this.getRegexString(),
            mode: this.getMode()
        };
    }
}

export class EntryList implements vscode.TreeDataProvider<FilterItem> {


    private regexList: FilterItem[] = [];

    private _onDidChangeTreeData: vscode.EventEmitter<FilterItem | undefined> = new vscode.EventEmitter<FilterItem | undefined>();
    readonly onDidChangeTreeData?: vscode.Event<FilterItem | undefined> = this._onDidChangeTreeData.event;

    getTreeItem(element: FilterItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: FilterItem | undefined): vscode.ProviderResult<FilterItem[]> {
        return this.regexList;
    }

    all() {
        return this.regexList;
    }

    add(regex: string) {
        this.regexList.push(new FilterItem(regex, FilterItemMode.Hide));
        this._onDidChangeTreeData.fire(undefined);
        this.save();
    }

	remove(item: FilterItem) {
        for (var i = 0; i < this.regexList.length; i++) {
            if (this.regexList[i] === item) {
                this.regexList.splice(i, 1);
                this._onDidChangeTreeData.fire(undefined);
                return;
            }
        }
        this.save();
	}

	update(item: FilterItem) {
        this._onDidChangeTreeData.fire(item);
        this.save();
	}

    save() {
        let workspaceDir = vscode.workspace.workspaceFolders;
        if (!workspaceDir || workspaceDir.length === 0) {
            return;
        }
        let configPath = workspaceDir[0].uri.fsPath;
        configPath = path.join(configPath, ".textfilter");
        let data = {
            regex: this.regexList.map(item => item.toJSON())
        };
        let fs = require("fs");
        fs.writeFile(configPath, JSON.stringify(data), (err: any)=>{
            if (err) {
                return console.error(err);
            }
        });
    }

    load() {
        let workspaceDir = vscode.workspace.workspaceFolders;
        if (!workspaceDir || workspaceDir.length === 0) {
            return;
        }
        let configPath = workspaceDir[0].uri.fsPath;
        configPath = path.join(configPath, ".textfilter");
        let fs = require("fs");
        fs.readFile(configPath, (err: any, data: any)=>{
            let loadedData = JSON.parse(data.toString());
            for (let item of loadedData['regex']) {
                this.regexList.push(FilterItem.build(item));
            }
            this._onDidChangeTreeData.fire(undefined);
        });
    }
}



export const regexRules = new EntryList();