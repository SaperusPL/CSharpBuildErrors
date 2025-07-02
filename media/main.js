// @ts-ignore
const vscode = acquireVsCodeApi();

window.addEventListener('message', event => {
    const message = event.data;
    if (message.type === 'update') {
        updateCounters(message.errorCount, message.warningCount);
        updateButtonStates(message.showErrors, message.showWarnings);
    }
});

function updateCounters(errorCount, warningCount) {
    const errorButton = document.getElementById('errors-button');
    const warningButton = document.getElementById('warnings-button');
    if (errorButton) {
        errorButton.textContent = `${errorCount} Errors`;
    }
    if (warningButton) {
        warningButton.textContent = `${warningCount} Warnings`;
    }
}

function updateButtonStates(showErrors, showWarnings) {
    const errorButton = document.getElementById('errors-button');
    const warningButton = document.getElementById('warnings-button');

    if (errorButton) {
        errorButton.classList.toggle('active', showErrors);
    }
    if (warningButton) {
        warningButton.classList.toggle('active', showWarnings);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const errorButton = document.getElementById('errors-button');
    const warningButton = document.getElementById('warnings-button');
    const clearButton = document.getElementById('clear-button');

    errorButton?.addEventListener('click', () => {
        vscode.postMessage({ command: 'toggleErrors' });
    });

    warningButton?.addEventListener('click', () => {
        vscode.postMessage({ command: 'toggleWarnings' });
    });

    clearButton?.addEventListener('click', () => {
        vscode.postMessage({ command: 'clear' });
    });
    
    // Request initial state
    vscode.postMessage({ command: 'requestInitialState' });
}); 
