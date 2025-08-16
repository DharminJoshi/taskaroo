import * as vscode from 'vscode';
import { TodoTreeProvider } from './provider/todoTreeProvider';
import { registerCommands } from './commands/registerCommands';
import { TodoCodeLensProvider } from './codelens/todoCodeLensProvider';
import { debounce } from './utils/debounce';

export async function activate(context: vscode.ExtensionContext) {
  console.log('Taskaroo extension activated');

  const todoTreeProvider = new TodoTreeProvider();
  vscode.window.registerTreeDataProvider('taskaroo.todoView', todoTreeProvider);

  // Register commands (refresh, openTask, addTodo, exportTasks, navigation)
  registerCommands(context, todoTreeProvider);

  // Create and show status bar item
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  statusBar.tooltip = 'Number of TODO/FIXME tasks in the workspace';
  context.subscriptions.push(statusBar);

  // Function to update status bar text
  async function updateStatusBar() {
    await todoTreeProvider.refresh(); // Refresh loads and applies filters
    const count = todoTreeProvider.getTodoCount();
    statusBar.text = `$(checklist) ${count} task${count !== 1 ? 's' : ''}`;
    statusBar.show();
  }

  // Initial load and status bar update
  await updateStatusBar();

  // Debounced refresh function
  const debouncedRefresh = debounce(async () => {
    await updateStatusBar();
  }, 500);

  // Listen to file saves and changes to auto-refresh
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => debouncedRefresh()),
    vscode.workspace.onDidChangeTextDocument(() => debouncedRefresh()),
    vscode.workspace.onDidCreateFiles(() => debouncedRefresh()),
    vscode.workspace.onDidDeleteFiles(() => debouncedRefresh())
  );

  // Register CodeLens provider for supported languages
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      [
        { language: 'javascript', scheme: 'file' },
        { language: 'typescript', scheme: 'file' },
        { language: 'python', scheme: 'file' },
        { language: 'java', scheme: 'file' },
        { language: 'cpp', scheme: 'file' },
        { language: 'html', scheme: 'file' },
      ],
      new TodoCodeLensProvider()
    )
  );
}

export function deactivate() {}
