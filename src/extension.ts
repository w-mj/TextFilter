import { workspace, Uri, window, commands, ExtensionContext, Disposable } from 'vscode';

import Provider from './provider';
import * as panel from './panel';


function addRule(to: panel.EntryList) {

}

export function activate(context: ExtensionContext) {
	console.log('Congratulations, your extension "logviewer" is now active!');

	const provider = new Provider();

	const providerRegisters = Disposable.from(
		workspace.registerTextDocumentContentProvider(Provider.scheme, provider)
	);


	const commandRegistration = commands.registerTextEditorCommand('logviewer.showLog', editor => {
		console.log(editor.document.uri.toString());
		const logUri = Uri.parse(`${Provider.scheme}:${editor.document.uri.toString()}`);
		console.log(logUri);
		return workspace.openTextDocument(logUri)
						.then(doc => window.showTextDocument(doc, editor.viewColumn! + 1));
	});

	context.subscriptions.push(provider, commandRegistration, providerRegisters);

	const regexRules = new panel.EntryList();
	regexRules.add("^$");

	window.registerTreeDataProvider('rule-panel', regexRules);

	commands.registerCommand('logviewer.add-rule', ()=>{
		window.showInputBox({
			prompt: "input regex",
		}).then(doc => {
			if (doc) {
				regexRules.add(doc);
			}
		});
	});

	commands.registerCommand('logviewer.rm-rule', (item)=>{
		regexRules.remove(item);
	});

	commands.registerCommand('logviewer.edit-rule', (item: panel.EntryItem)=>{
		window.showInputBox({
			value: item.getRegex()
		}).then(doc => {
			if (doc === undefined || doc === '') {
				regexRules.remove(item);
			} else if (doc !== item.getRegex()) {
				item.setRegex(doc);
				regexRules.update(item);
			}
		});
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}
