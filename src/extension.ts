import { workspace, Uri, window, commands, ExtensionContext, Disposable } from 'vscode';

import Provider from './provider';

export function activate(context: ExtensionContext) {
	console.log('Congratulations, your extension "logviewer" is now active!');

	const provider = new Provider();

	const providerRegisters = Disposable.from(
		workspace.registerTextDocumentContentProvider(Provider.scheme, provider)
	);


	const commandRegistration = commands.registerTextEditorCommand('editor.printReferences', editor => {
		console.log(editor.document.uri.toString());
		const logUri = Uri.parse(`${Provider.scheme}:${editor.document.uri.toString()}`);
		console.log(logUri);
		return workspace.openTextDocument(logUri)
						.then(doc => window.showTextDocument(doc, editor.viewColumn! + 1));
	});


	context.subscriptions.push(provider, commandRegistration, providerRegisters);
}

// this method is called when your extension is deactivated
export function deactivate() {}
