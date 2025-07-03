import * as vscode from 'vscode';

export class TerminalMonitor implements vscode.Disposable {
    private _onBuildOutput = new vscode.EventEmitter<string>();
    readonly onBuildOutput = this._onBuildOutput.event;
    
    private buffer = '';
    private listener: vscode.Disposable;
    private timer: NodeJS.Timeout | undefined;

    constructor() {
        // @ts-ignore
        this.listener = vscode.window.onDidWriteTerminalData((e: any) => {
            this.buffer += e.data;

            if (this.timer) {
                clearTimeout(this.timer);
            }

            this.timer = setTimeout(() => {
                // Strip ANSI color codes from the buffer before processing
                const cleanBuffer = this.buffer.replace(/[\u001b\u009b][[()#;?]*.{0,2}?[0-9]*[; Zabcd"fmnglrh]?/g, '');

                // Only process buffer if it seems to contain C# build output.
                if (cleanBuffer.includes(': warning CS') || cleanBuffer.includes(': error CS')) {
                    this._onBuildOutput.fire(cleanBuffer);
                }
                this.buffer = ''; // Clear buffer after processing
            }, 1000); // Wait for 1s of silence before processing
        });
    }

    dispose() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.listener.dispose();
        this._onBuildOutput.dispose();
    }
} 
