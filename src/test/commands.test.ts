import * as vscode from 'vscode';
import * as assert from 'assert';

suite('Command Registration Tests', () => {
  const commands = [
    'taskaroo.refreshTasks',
    'taskaroo.openTask',
    'taskaroo.addTodo',
    'taskaroo.exportTasks',
    'taskaroo.navigateNext',
    'taskaroo.navigatePrev'
  ];

  commands.forEach(cmd => {
    test(`Command ${cmd} should be registered`, async () => {
      const all = await vscode.commands.getCommands(true);
      assert.ok(all.includes(cmd), `Command ${cmd} is not registered`);
    });
  });
});
