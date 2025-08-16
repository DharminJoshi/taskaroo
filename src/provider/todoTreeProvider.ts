import * as vscode from 'vscode';
import * as path from 'path';
import { TodoItem } from '../types/todoTypes';
import { parseTodosInWorkspace } from '../parser/todoParser';

export class TodoTreeProvider implements vscode.TreeDataProvider<TodoItem | vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TodoItem | vscode.TreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private allTodos: TodoItem[] = []; // Original list
  private todos: TodoItem[] = [];    // Filtered list
  private groupBy: 'file' | 'tag' = 'file';
  private filterText: string = '';

  constructor() {}

  // Reloads TODOs and refreshes view
  public async refresh(): Promise<void> {
    await this.loadTodos();
    this._onDidChangeTreeData.fire();
  }

  // Parses and updates TODOs
  public async loadTodos(): Promise<void> {
    this.allTodos = await parseTodosInWorkspace();
    this.applyFilterAndSort();
  }

  // Returns filtered todo count
  public getTodoCount(): number {
    return this.todos.length;
  }

  // Expose full filtered list
  public async getAllTodos(): Promise<TodoItem[]> {
    return this.todos;
  }

  // Set text filter and refresh view
  public setFilterText(text: string): void {
    this.filterText = text;
    this.applyFilterAndSort();
    this._onDidChangeTreeData.fire();
  }

  // Set grouping mode and refresh view
  public setGroupBy(groupBy: 'file' | 'tag'): void {
    this.groupBy = groupBy;
    this._onDidChangeTreeData.fire();
  }

  // Filter + sort todos
  private applyFilterAndSort(): void {
    let filtered = this.allTodos;

    if (this.filterText) {
      const ft = this.filterText.toLowerCase();
      filtered = filtered.filter(todo =>
        todo.label.toLowerCase().includes(ft) ||
        todo.fileUri.fsPath.toLowerCase().includes(ft)
      );
    }

    filtered.sort((a, b) => {
      const c = a.fileUri.fsPath.localeCompare(b.fileUri.fsPath);
      return c !== 0 ? c : a.line - b.line;
    });

    this.todos = filtered;
  }

  // Convert TodoItem to TreeItem
  public getTreeItem(element: TodoItem | vscode.TreeItem): vscode.TreeItem {
    if (element instanceof TodoItem) {
      element.iconPath = element.isDone
        ? new vscode.ThemeIcon('check')
        : new vscode.ThemeIcon('circle-outline');

      element.tooltip = `${element.label}\n${element.fileUri.fsPath}:${element.line + 1}`;
      element.contextValue = 'todoItem';
      return element;
    }

    return element;
  }

  // Group by file or tag
  public async getChildren(element?: TodoItem | vscode.TreeItem): Promise<Array<TodoItem | vscode.TreeItem>> {
    if (!element) {
      if (this.groupBy === 'file') {
        const fileMap = new Map<string, vscode.TreeItem>();
        for (const todo of this.todos) {
          const filePath = todo.fileUri.fsPath;
          if (!fileMap.has(filePath)) {
            const label = path.basename(filePath);
            const fileItem = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.Collapsed);
            fileItem.resourceUri = todo.fileUri;
            fileItem.contextValue = 'fileGroup';
            fileMap.set(filePath, fileItem);
          }
        }
        return Array.from(fileMap.values());
      } else {
        const tagMap = new Map<string, vscode.TreeItem>();
        for (const todo of this.todos) {
          const tag = todo.label.split(':')[0].trim();
          if (!tagMap.has(tag)) {
            const tagItem = new vscode.TreeItem(tag, vscode.TreeItemCollapsibleState.Collapsed);
            tagItem.contextValue = 'tagGroup';
            tagMap.set(tag, tagItem);
          }
        }
        return Array.from(tagMap.values());
      }
    }

    // Children of file group
    if ((element as vscode.TreeItem).resourceUri) {
      return this.todos.filter(todo =>
        todo.fileUri.fsPath === (element as vscode.TreeItem).resourceUri!.fsPath
      );
    }

    // Children of tag group
    const tag = (element.label as string).trim();
    return this.todos.filter(todo =>
      todo.label.toLowerCase().startsWith(tag.toLowerCase() + ':') ||
      todo.label.toLowerCase().startsWith(tag.toLowerCase() + ' (')
    );
  }
}
