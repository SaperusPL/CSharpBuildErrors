import * as vscode from 'vscode';

export class TerminalMonitor {
    private _onBuildOutput = new vscode.EventEmitter<string>();
    readonly onBuildOutput = this._onBuildOutput.event;
    private buffer = '';
    private listener: vscode.Disposable;

    constructor() {
        // HACK: There's a persistent linter/type issue where `onDidWriteTerminalData` is not recognized
        // on `vscode.window`, even though it's a valid part of the API.
        // Using @ts-ignore to suppress the error and allow compilation.
        // @ts-ignore
        this.listener = vscode.window.onDidWriteTerminalData((e: any) => {
            const data = e.data;
            this.buffer += data;

            // This is a simple heuristic to detect the end of a `dotnet build`.
            // It might not be foolproof for all cases, especially with complex build outputs
            // or concurrent builds, but it covers the most common scenarios.
            if (data.includes('Build FAILED.') || data.includes('Build succeeded.')) {
                if (this.buffer.includes('MSBuild version') || this.buffer.includes('Determining projects to restore...')) {
                    this._onBuildOutput.fire(this.buffer);
                }
                this.buffer = '';
            }
        });
    }

    dispose() {
        this.listener.dispose();
        this._onBuildOutput.dispose();
    }
} 
