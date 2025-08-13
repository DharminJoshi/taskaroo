import * as vscode from 'vscode';

export type SeverityLevel = 'low' | 'medium' | 'high';

export class TodoItem extends vscode.TreeItem {
  public isDone: boolean;
  public severity: SeverityLevel;
  public dueDate?: Date;

  constructor(
    public readonly label: string,
    public readonly fileUri: vscode.Uri,
    public readonly line: number,
    severity: SeverityLevel = 'medium',
    dueDate?: Date,
    isDone: boolean = false,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
    public readonly command?: vscode.Command,
  ) {
    super(label, collapsibleState);
    this.isDone = isDone;
    this.severity = severity;
    this.dueDate = dueDate;

    // Icon reflects done status
    this.iconPath = isDone
      ? new vscode.ThemeIcon('check')
      : new vscode.ThemeIcon('circle-outline');

    // Optional: add severity icon or color (can customize further)
  }
}
