import * as vscode from 'vscode';
import { StateManager } from './StateManager';

export class FiltersViewProvider implements vscode.WebviewViewProvider {
    
    public static readonly viewType = 'build-errors.filtersView';

    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly stateManager: StateManager,
    ) { 
        this.stateManager.onDidChange(() => {
            this.updateWebview();
        });
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, 'media')
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.command) {
                case 'toggleErrors':
                    this.stateManager.setShowErrors(!this.stateManager.getShowErrors());
                    break;
                case 'toggleWarnings':
                    this.stateManager.setShowWarnings(!this.stateManager.getShowWarnings());
                    break;
                case 'clear':
                    this.stateManager.clear();
                    break;
                case 'requestInitialState':
                    this.updateWebview();
                    break;
            }
        });
    }

    public updateWebview() {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'update',
                errorCount: this.stateManager.getErrorCount(),
                warningCount: this.stateManager.getWarningCount(),
                showErrors: this.stateManager.getShowErrors(),
                showWarnings: this.stateManager.getShowWarnings(),
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const stylesUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'styles.css'));
        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));

        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${stylesUri}" rel="stylesheet">
                <link href="${codiconsUri}" rel="stylesheet" />
                <title>Build Error Filters</title>
            </head>
            <body>
                <div class="controls-container">
                    <button id="errors-button" class="control-button"></button>
                    <button id="warnings-button" class="control-button"></button>
                    <button id="clear-button" class="icon-button" title="Clear All">
                        <i class="codicon codicon-trash"></i>
                    </button>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
} 
