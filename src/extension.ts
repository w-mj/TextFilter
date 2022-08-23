import { workspace, Uri, window, commands, ExtensionContext, Disposable, languages } from 'vscode';

import Provider from './provider';
import * as panel from './panel';
import { regexRules } from './panel';


export function activate(context: ExtensionContext) {
	const provider = new Provider();

	const providerRegisters = Disposable.from(
		workspace.registerTextDocumentContentProvider(Provider.scheme, provider),
		languages.registerDocumentLinkProvider({ scheme: Provider.scheme }, provider)
	);


	const commandRegistration = commands.registerTextEditorCommand('logviewer.showLog', editor => {
		const logUri = Uri.parse(`${Provider.scheme}:${editor.document.uri.toString()}`);
		// console.log(logUri);
		return workspace.openTextDocument(logUri)
						.then(doc => window.showTextDocument(doc, editor.viewColumn! + 1));
	});

	context.subscriptions.push(provider, commandRegistration, providerRegisters);

	window.registerTreeDataProvider('rule-panel', regexRules);

	commands.registerCommand('logviewer.add-rule', ()=>{
		window.showInputBox({
			prompt: "input regex",
		}).then(doc => {
			if (doc) {
				regexRules.add(doc);
				provider.update(undefined);
			}
		});
	});

	commands.registerCommand('logviewer.rm-rule', (item)=>{
		regexRules.remove(item);
		provider.update(undefined);
	});

	commands.registerCommand('logviewer.edit-rule', (item: panel.FilterItem)=>{
		window.showInputBox({
			value: item.getRegexString()
		}).then(doc => {
			if (doc === undefined || doc === '') {
				regexRules.remove(item);
				provider.update(undefined);
			} else if (doc !== item.getRegexString()) {
				item.setRegex(doc);
				regexRules.update(item);
				provider.update(undefined);
			}
		});
	});

	commands.registerCommand("logviewer.change-mode", (item: panel.FilterItem)=>{
		item.changeMode();
		regexRules.update(item);
		provider.update(undefined);
	});


	regexRules.load();
}

// this method is called when your extension is deactivated
export function deactivate() {}
