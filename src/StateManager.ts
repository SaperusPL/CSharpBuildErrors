import * as vscode from 'vscode';
import { BuildProblem } from './types';

export class StateManager {
    private _onDidChange = new vscode.EventEmitter<void>();
    readonly onDidChange = this._onDidChange.event;

    private problems: BuildProblem[] = [];
    private showErrors = true;
    private showWarnings = true;

    constructor(private globalState: vscode.Memento) {
        this.showErrors = this.globalState.get('showErrors', true);
        this.showWarnings = this.globalState.get('showWarnings', true);
    }

    getProblems(): BuildProblem[] {
        return this.problems.filter(p => {
            if (this.showErrors && p.isError) {
                return true;
            }
            if (this.showWarnings && !p.isError) {
                return true;
            }
            return false;
        });
    }

    setProblems(problems: BuildProblem[]) {
        this.problems = problems;
        this._onDidChange.fire();
    }

    setShowErrors(show: boolean) {
        if (this.showErrors !== show) {
            this.showErrors = show;
            this.globalState.update('showErrors', this.showErrors);
            this._onDidChange.fire();
        }
    }

    setShowWarnings(show: boolean) {
        if (this.showWarnings !== show) {
            this.showWarnings = show;
            this.globalState.update('showWarnings', this.showWarnings);
            this._onDidChange.fire();
        }
    }

    getShowErrors(): boolean {
        return this.showErrors;
    }

    getShowWarnings(): boolean {
        return this.showWarnings;
    }

    getErrorCount(): number {
        return this.problems.filter(p => p.isError).length;
    }

    getWarningCount(): number {
        return this.problems.filter(p => !p.isError).length;
    }

    removeProblem(problemToRemove: BuildProblem) {
        this.problems = this.problems.filter(p => p.raw !== problemToRemove.raw);
        this._onDidChange.fire();
    }

    clear() {
        this.problems = [];
        this._onDidChange.fire();
    }
} 
