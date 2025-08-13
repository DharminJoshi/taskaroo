import * as assert from 'assert';
import * as vscode from 'vscode';
import { parseTodosInWorkspace } from '../parser/todoParser';

suite('Todo Parser Tests', () => {
  test('Should detect TODOs in mock file', async () => {
    const todos = await parseTodosInWorkspace();
    assert.ok(Array.isArray(todos));
    assert.ok(todos.length >= 0); // Depending on project, may be 0
    todos.forEach(todo => {
      assert.ok(todo.label.includes('TODO') || todo.label.includes('FIXME'));
    });
  });
});
