// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { BuildErrorsController } from './BuildErrorsController';

let controller: BuildErrorsController | undefined;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	controller = new BuildErrorsController(context);
	context.subscriptions.push(controller);
}

// This method is called when your extension is deactivated
export function deactivate() {
	// The controller is disposed of automatically by VS Code 
	// because it was added to context.subscriptions.
	// No need to call dispose() manually here.
}
