import * as vscode from 'vscode';

// Regex to detect TODOs (simple version, adjust if needed)
const TODO_REGEX = /(?:\/\/|#|<!--|\/\*|--)\s*(TODO|FIXME|HACK):?\s*(.*?)(?:-->|\/\*)?$/i;

export class TodoCodeLensProvider implements vscode.CodeLensProvider {
  private onDidChangeCodeLensesEmitter = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses = this.onDidChangeCodeLensesEmitter.event;

  constructor() {
    // Optionally listen for config changes or file changes to refresh CodeLenses
    vscode.workspace.onDidChangeConfiguration(() => {
      this.onDidChangeCodeLensesEmitter.fire();
    });
  }

  provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    const codeLenses: vscode.CodeLens[] = [];

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const match = TODO_REGEX.exec(line.text);
      if (match) {
        // Range for entire line TODO comment
        const range = new vscode.Range(i, 0, i, line.text.length);

        // Create CodeLens commands, e.g. Open TODO location (here just current location)
        const openCmd: vscode.Command = {
          title: 'Open TODO',
          command: 'taskaroo.openTask',
          arguments: [{ fileUri: document.uri, line: i }],
          tooltip: 'Go to this TODO',
        };

        // You can add more commands, e.g. Mark as done or Edit TODO, here just one for example
        codeLenses.push(new vscode.CodeLens(range, openCmd));
      }
    }

    return codeLenses;
  }
}
