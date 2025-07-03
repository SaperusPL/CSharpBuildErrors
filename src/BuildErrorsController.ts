import * as vscode from 'vscode';
import { BuildOutputParser } from './BuildOutputParser';
import { StateManager } from './StateManager';
import { TerminalMonitor } from './TerminalMonitor';
import { ProblemsTreeProvider } from './ProblemsTreeProvider';

export class BuildErrorsController {

    private stateManager: StateManager;
    private disposables: vscode.Disposable[] = [];

    constructor(private context: vscode.ExtensionContext) {
        this.stateManager = new StateManager(context.globalState);
        
        const terminalMonitor = new TerminalMonitor();
        this.disposables.push(terminalMonitor);

        const problemsTreeProvider = new ProblemsTreeProvider(this.stateManager);

        this.registerViews(problemsTreeProvider);
        this.registerCommands();
        this.setupEventListeners(terminalMonitor);
    }

    private registerViews(problemsTreeProvider: ProblemsTreeProvider) {
        const problemsView = vscode.window.createTreeView('build-errors.problemsView', { treeDataProvider: problemsTreeProvider });
        this.disposables.push(problemsView);
    }

    private registerCommands() {
        const navigateToErrorCommand = vscode.commands.registerCommand('csharp-build-errors.navigateToError', (problem) => {
            const openPath = vscode.Uri.file(problem.filePath);
            vscode.workspace.openTextDocument(openPath).then(doc => {
                vscode.window.showTextDocument(doc, {
                    selection: new vscode.Range(problem.line - 1, problem.character - 1, problem.line - 1, problem.character - 1)
                });
            });
        });
        this.disposables.push(navigateToErrorCommand);

        this.disposables.push(
            vscode.commands.registerCommand('csharp-build-errors.toggleErrors', () => {
                this.stateManager.setShowErrors(!this.stateManager.getShowErrors());
            }),
            vscode.commands.registerCommand('csharp-build-errors.toggleWarnings', () => {
                this.stateManager.setShowWarnings(!this.stateManager.getShowWarnings());
            }),
            vscode.commands.registerCommand('csharp-build-errors.clear', () => {
                this.stateManager.clear();
            })
        );
    }

    private setupEventListeners(terminalMonitor: TerminalMonitor) {
        terminalMonitor.onBuildOutput(output => {
            const problems = BuildOutputParser.parse(output);
            this.stateManager.setProblems(problems);
        });
    }
    
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
} 
