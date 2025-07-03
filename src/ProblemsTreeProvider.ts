import * as vscode from 'vscode';
import * as path from 'path';
import { StateManager } from './StateManager';
import { BuildProblem } from './types';

export class ProblemsTreeProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private stateManager: StateManager) {
        this.stateManager.onDidChange(() => {
            this._onDidChangeTreeData.fire();
        });
    }

    getTreeItem(element: TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeItem): Thenable<TreeItem[]> {
        if (!vscode.workspace.workspaceFolders) {
            return Promise.resolve([]);
        }

        const problems = this.stateManager.getProblems();

        if (problems.length === 0) {
            return Promise.resolve([]);
        }

        if (element) {
            // Child nodes (problems in a file)
            if (element instanceof FileTreeItem) {
                const elementPath = element.resourceUri?.fsPath;
                if (!elementPath) { return Promise.resolve([]); }

                // Normalize paths for case-insensitive comparison.
                const problemsInFile = problems.filter(p => p.filePath.toLowerCase() === elementPath.toLowerCase());
                
                return Promise.resolve(
                    problemsInFile
                        .sort((a, b) => a.line - b.line)
                        .map(p => new ProblemTreeItem(p))
                );
            }
            return Promise.resolve([]);
        } else {
            // Root nodes (files)
            const problemsByFile = problems.reduce((acc, problem) => {
                if (!acc[problem.filePath]) {
                    acc[problem.filePath] = [];
                }
                acc[problem.filePath].push(problem);
                return acc;
            }, {} as { [key: string]: BuildProblem[] });

            const filePaths = Object.keys(problemsByFile).sort();

            return Promise.resolve(
                filePaths.map(filePath => new FileTreeItem(vscode.Uri.file(filePath)))
            );
        }
    }
}

type TreeItem = FileTreeItem | ProblemTreeItem;

class FileTreeItem extends vscode.TreeItem {
    constructor(
        public readonly resourceUri: vscode.Uri,
    ) {
        // Pass the resource URI directly to the parent constructor.
        // This lets VS Code handle creating the label, which is more robust
        // and should fix the path corruption issue.
        super(resourceUri, vscode.TreeItemCollapsibleState.Expanded);
    }
}

class ProblemTreeItem extends vscode.TreeItem {
    constructor(
        public readonly problem: BuildProblem
    ) {
        super(`L${problem.line}:${problem.character}`);
        this.description = problem.message;
        this.collapsibleState = vscode.TreeItemCollapsibleState.None;
        this.iconPath = problem.isError
            ? new vscode.ThemeIcon('error')
            : new vscode.ThemeIcon('warning');
        
        this.tooltip = problem.raw;

        this.command = {
            command: 'csharp-build-errors.navigateToError',
            title: 'Nawiguj do błędu',
            arguments: [problem]
        };
    }
} 
