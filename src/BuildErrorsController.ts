import * as vscode from 'vscode';
import { StateManager } from './StateManager';
import { TerminalMonitor } from './TerminalMonitor';
import { ProblemsTreeProvider } from './ProblemsTreeProvider';
import { FiltersViewProvider } from './FiltersViewProvider';
import { BuildProblem } from './types';
import { BuildOutputParser } from './BuildOutputParser';

export class BuildErrorsController {
    private context: vscode.ExtensionContext;
    private stateManager: StateManager;
    private terminalMonitor: TerminalMonitor;
    private problemsTreeProvider: ProblemsTreeProvider;
    private problemsTreeView: vscode.TreeView<any>;
    private filtersViewProvider: FiltersViewProvider;
    private disposables: vscode.Disposable[] = [];

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        
        this.stateManager = new StateManager(context.globalState);
        this.terminalMonitor = new TerminalMonitor();
        
        this.problemsTreeProvider = new ProblemsTreeProvider(this.stateManager);
        this.problemsTreeView = vscode.window.createTreeView('build-errors.problemsView', { treeDataProvider: this.problemsTreeProvider });
        this.filtersViewProvider = new FiltersViewProvider(context.extensionUri, this.stateManager);

        this.registerViews();
        this.registerCommands();
        this.setupEventListeners();
    }

    private registerViews() {
        this.disposables.push(vscode.window.registerWebviewViewProvider(FiltersViewProvider.viewType, this.filtersViewProvider));
        this.disposables.push(this.problemsTreeView);
    }

    private registerCommands() {
        const navigateToErrorCommand = vscode.commands.registerCommand('csharp-build-errors.navigateToError', async (problem: BuildProblem) => {
            try {
                const uri = vscode.Uri.file(problem.filePath);
                await vscode.workspace.fs.stat(uri); // Check for file existence

                const doc = await vscode.workspace.openTextDocument(uri);

                if (problem.line > doc.lineCount) {
                    this.stateManager.removeProblem(problem);
                    vscode.window.showWarningMessage(`Problem in '${problem.filePath}' is outdated (line ${problem.line} does not exist). It has been removed.`);
                    return;
                }

                const editor = await vscode.window.showTextDocument(doc);
                const position = new vscode.Position(problem.line - 1, Math.max(0, problem.character - 1));
                const range = new vscode.Range(position, position);
                editor.selection = new vscode.Selection(position, position);
                editor.revealRange(range, vscode.TextEditorRevealType.InCenter);

            } catch (error) {
                // File does not exist, remove the problem.
                this.stateManager.removeProblem(problem);
                vscode.window.showWarningMessage(`File '${problem.filePath}' not found. The problem has been removed.`);
            }
        });
        this.disposables.push(navigateToErrorCommand);
    }

    private setupEventListeners() {
        this.stateManager.onDidChange(() => {
            const problemCount = this.stateManager.getProblems().length;
            if (problemCount === 0) {
                this.problemsTreeView.message = "Brak danych";
            } else {
                this.problemsTreeView.message = undefined;
            }
        });

        this.terminalMonitor.onBuildOutput(output => {
            const problems = BuildOutputParser.parse(output);
            this.stateManager.setProblems(problems);
        });
    }
    
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
} 
