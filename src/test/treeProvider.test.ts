import * as assert from 'assert';
import { TodoTreeProvider } from '../provider/todoTreeProvider';

suite('Tree Provider Tests', () => {
  test('Should load and return todos', async () => {
    const provider = new TodoTreeProvider();
    await provider.loadTodos();
    const todos = await provider.getAllTodos();
    assert.ok(Array.isArray(todos));
  });

  test('Should support setting filters', async () => {
    const provider = new TodoTreeProvider();
    await provider.loadTodos();
    provider.setFilterText('nonexistenttext');
    assert.strictEqual(provider.getTodoCount(), 0);
  });
});
