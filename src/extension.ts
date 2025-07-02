// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { BuildErrorsController } from './BuildErrorsController';

let controller: BuildErrorsController | undefined;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "csharpbuilderrors" is now active!');

	controller = new BuildErrorsController(context);
	context.subscriptions.push(controller);
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (controller) {
		controller.dispose();
		controller = undefined;
	}
}
