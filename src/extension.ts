import { workspace, Uri, window, commands, ExtensionContext, Disposable } from 'vscode';

import Provider from './provider';
import * as panel from './panel';
import { regexRules } from './panel';


export function activate(context: ExtensionContext) {
	console.log('Congratulations, your extension "logviewer" is now active!');

	const provider = new Provider();

	const providerRegisters = Disposable.from(
		workspace.registerTextDocumentContentProvider(Provider.scheme, provider)
	);


	const commandRegistration = commands.registerTextEditorCommand('logviewer.showLog', editor => {
		const logUri = Uri.parse(`${Provider.scheme}:${editor.document.uri.toString()}`);
		console.log(logUri);
		return workspace.openTextDocument(logUri)
						.then(doc => window.showTextDocument(doc, editor.viewColumn! + 1));
	});

	context.subscriptions.push(provider, commandRegistration, providerRegisters);

	regexRules.add("^$");

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
}

// this method is called when your extension is deactivated
export function deactivate() {}
