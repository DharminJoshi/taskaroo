import * as vscode from 'vscode';
import * as path from 'path';
import { TodoItem } from '../types/todoTypes';
import { parseTodosInWorkspace } from '../parser/todoParser';

export class TodoTreeProvider implements vscode.TreeDataProvider<TodoItem | vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<TodoItem | vscode.TreeItem | undefined | void> = new vscode.EventEmitter();
  readonly onDidChangeTreeData: vscode.Event<TodoItem | vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

  private todos: TodoItem[] = [];
  private groupBy: 'file' | 'tag' = 'file'; // Configurable grouping
  private filterText: string = ''; // Filtering input

  constructor() {}

  async refresh(): Promise<void> {
    await this.loadTodos();
    this._onDidChangeTreeData.fire();
  }

  async loadTodos(): Promise<void> {
    this.todos = await parseTodosInWorkspace();
    this.applyFilterAndSort();
  }

  // Filter and sort todos based on filterText and sort order
  private applyFilterAndSort() {
    let filtered = this.todos;

    if (this.filterText) {
      const lowerFilter = this.filterText.toLowerCase();
      filtered = filtered.filter(todo =>
        todo.label.toLowerCase().includes(lowerFilter) ||
        todo.fileUri.fsPath.toLowerCase().includes(lowerFilter)
      );
    }

    filtered.sort((a, b) => {
      const fileCmp = a.fileUri.fsPath.localeCompare(b.fileUri.fsPath);
      if (fileCmp !== 0) {return fileCmp;}
      return a.line - b.line;
    });

    this.todos = filtered;
  }

  setGroupBy(groupBy: 'file' | 'tag'): void {
    this.groupBy = groupBy;
    this._onDidChangeTreeData.fire();
  }

  setFilterText(text: string): void {
    this.filterText = text;
    this.applyFilterAndSort();
    this._onDidChangeTreeData.fire();
  }

  getTodoCount(): number {
    return this.todos.length;
  }

  public async getAllTodos(): Promise<TodoItem[]> {
    return this.todos;
  }

  getTreeItem(element: TodoItem | vscode.TreeItem): vscode.TreeItem {
    if (element instanceof TodoItem) {
      const isDone = (element as any).isDone ?? false;

      element.iconPath = isDone
        ? new vscode.ThemeIcon('check')
        : new vscode.ThemeIcon('circle-outline');

      element.tooltip = `${element.label}\n${element.fileUri.fsPath}:${element.line + 1}`;
      element.contextValue = 'todoItem';

      return element;
    }
    // For group nodes
    return element;
  }

  async getChildren(element?: TodoItem | vscode.TreeItem): Promise<(TodoItem | vscode.TreeItem)[]> {
    if (!element) {
      // Top-level groups or flat list
      if (this.groupBy === 'file') {
        const filesMap = new Map<string, vscode.TreeItem>();
        for (const todo of this.todos) {
          const filePath = todo.fileUri.fsPath;
          if (!filesMap.has(filePath)) {
            const fileName = path.basename(filePath);
            const fileItem = new vscode.TreeItem(fileName, vscode.TreeItemCollapsibleState.Collapsed);
            fileItem.resourceUri = todo.fileUri;
            fileItem.contextValue = 'fileGroup';
            filesMap.set(filePath, fileItem);
          }
        }
        return Array.from(filesMap.values());
      } else if (this.groupBy === 'tag') {
        const tagsMap = new Map<string, vscode.TreeItem>();
        for (const todo of this.todos) {
          const tag = todo.label.split(':')[0];
          if (!tagsMap.has(tag)) {
            const tagItem = new vscode.TreeItem(tag, vscode.TreeItemCollapsibleState.Collapsed);
            tagItem.contextValue = 'tagGroup';
            tagsMap.set(tag, tagItem);
          }
        }
        return Array.from(tagsMap.values());
      }
      // fallback to flat list
      return this.todos;
    }

    // If element is group node
    if (element.resourceUri) {
      // Grouped by file
      return this.todos.filter(todo => todo.fileUri.fsPath === element.resourceUri?.fsPath);
    } else {
      // Grouped by tag
      const tag = element.label;
      return this.todos.filter(todo => todo.label.startsWith(tag as string));
    }
  }
}
