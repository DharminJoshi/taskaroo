import * as vscode from 'vscode';
import { TodoTreeProvider } from '../provider/todoTreeProvider';

export function registerCommands(context: vscode.ExtensionContext, todoTreeProvider: TodoTreeProvider) {
  context.subscriptions.push(
    // Refresh TODO tree view
    vscode.commands.registerCommand('taskaroo.refreshTasks', () => {
      todoTreeProvider.refresh();
    }),

    // Open the task location in editor
    vscode.commands.registerCommand('taskaroo.openTask', (task: { fileUri: vscode.Uri; line: number }) => {
      if (!task || !task.fileUri) {
        vscode.window.showErrorMessage('Invalid task data.');
        return;
      }

      vscode.workspace.openTextDocument(task.fileUri).then(doc => {
        vscode.window.showTextDocument(doc).then(editor => {
          const position = new vscode.Position(task.line, 0);
          editor.selection = new vscode.Selection(position, position);
          editor.revealRange(new vscode.Range(position, position));
        });
      });
    }),

    // Add a new TODO at cursor position
    vscode.commands.registerCommand('taskaroo.addTodo', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('Open a file first to add a TODO.');
        return;
      }

      const tag = await vscode.window.showQuickPick(['TODO', 'FIXME', 'HACK'], { placeHolder: 'Select TODO tag' });
      if (!tag) {return;}

      const commentText = await vscode.window.showInputBox({ prompt: 'Enter TODO comment text' });
      if (!commentText) {return;}

      // Determine comment syntax based on language
      const langId = editor.document.languageId;
      let commentPrefix = '//';
      if (langId === 'python' || langId === 'shellscript') {commentPrefix = '#';}
      else if (langId === 'html' || langId === 'xml') {commentPrefix = '<!--';}
      else if (langId === 'css') {commentPrefix = '/*';}

      const insertText =
        commentPrefix === '<!--'
          ? `<!-- ${tag}: ${commentText} -->`
          : commentPrefix === '/*'
          ? `/* ${tag}: ${commentText} */`
          : `${commentPrefix} ${tag}: ${commentText}`;

      await editor.edit(editBuilder => {
        editBuilder.insert(editor.selection.active, insertText + '\n');
      });

      vscode.window.showInformationMessage(`Added ${tag} comment.`);
      todoTreeProvider.refresh();
    }),

    // Export TODOs to a file
    vscode.commands.registerCommand('taskaroo.exportTodos', async () => {
      const todos = todoTreeProvider.getAllTodos ? await todoTreeProvider.getAllTodos() : [];
      if (todos.length === 0) {
        vscode.window.showInformationMessage('No TODOs to export.');
        return;
      }

      const uri = await vscode.window.showSaveDialog({ filters: { 'Text Files': ['txt'] }, saveLabel: 'Export TODOs' });
      if (!uri) {return;}

      const lines = todos.map(todo => `${todo.label} (${todo.fileUri.fsPath}:${todo.line + 1})`);
      const content = lines.join('\n');

      await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
      vscode.window.showInformationMessage(`Exported ${todos.length} TODOs to ${uri.fsPath}`);
    }),

    // Jump to next TODO
    vscode.commands.registerCommand('taskaroo.nextTodo', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('Open a file first.');
        return;
      }
      const todos = todoTreeProvider.getAllTodos ? await todoTreeProvider.getAllTodos() : [];
      if (!todos.length) {
        vscode.window.showInformationMessage('No TODOs found.');
        return;
      }

      const currentPos = editor.selection.active;
      // Find the next TODO after current position in the same file
      const next = todos.find(todo => {
        return todo.fileUri.fsPath === editor.document.uri.fsPath && todo.line > currentPos.line;
      });

      if (next) {
        vscode.commands.executeCommand('taskaroo.openTask', { fileUri: next.fileUri, line: next.line });
      } else {
        vscode.window.showInformationMessage('No next TODO found in this file.');
      }
    }),

    // Jump to previous TODO
    vscode.commands.registerCommand('taskaroo.previousTodo', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('Open a file first.');
        return;
      }
      const todos = todoTreeProvider.getAllTodos ? await todoTreeProvider.getAllTodos() : [];
      if (!todos.length) {
        vscode.window.showInformationMessage('No TODOs found.');
        return;
      }

      const currentPos = editor.selection.active;
      // Find previous TODO before current position in the same file
      const prevTodos = todos.filter(todo => todo.fileUri.fsPath === editor.document.uri.fsPath && todo.line < currentPos.line);
      if (prevTodos.length) {
        const prev = prevTodos[prevTodos.length - 1];
        vscode.commands.executeCommand('taskaroo.openTask', { fileUri: prev.fileUri, line: prev.line });
      } else {
        vscode.window.showInformationMessage('No previous TODO found in this file.');
      }
    }),
  );
}
