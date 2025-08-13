import * as vscode from 'vscode';
import { TodoItem } from '../types/todoTypes';

// Supported comment prefixes per language or generic
const COMMENT_PREFIXES = ['//', '#', '<!--'];

// Function to escape regex special chars in tags
function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Map severity marker to SeverityLevel type
function mapSeverity(marker: string | null): 'low' | 'medium' | 'high' {
  if (marker === '!') {return 'high';}
  if (marker === '?') {return 'low';}
  return 'medium';
}

// Parse due date string (YYYY-MM-DD) to Date object or undefined
function parseDueDate(dateStr: string | null): Date | undefined {
  if (!dateStr) {return undefined;}
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? undefined : date;
}

export async function parseTodosInWorkspace(): Promise<TodoItem[]> {
  const todos: TodoItem[] = [];

  if (!vscode.workspace.workspaceFolders) {
    return todos;
  }

  // Read custom tags from config or default list
  const config = vscode.workspace.getConfiguration('taskaroo');
  const customTags: string[] = config.get('customTags') || ['TODO', 'FIXME', 'HACK', 'URGENT'];

  // Build regex pattern for tags
  const tagsPattern = customTags.map(escapeRegex).join('|');

  // Regex explanation:
  // ^\s*(commentPrefix)\s*(tag)(dueDate)?(severity)?\s*:\s*(text)$
  // e.g. // TODO(2025-08-20)!: fix this
  const regex = new RegExp(
    `^(?:${COMMENT_PREFIXES.map(escapeRegex).join('|')})\\s*` + // comment prefixes
    `(${tagsPattern})` +                                         // tag
    `(?:\\((\\d{4}-\\d{2}-\\d{2})\\))?` +                       // optional due date in (YYYY-MM-DD)
    `([!?])?` +                                                 // optional severity marker (! or ?)
    `:?\\s*(.*)$`,                                              // comment text
    'i'
  );

  const files = await vscode.workspace.findFiles(
    '**/*.{ts,js,jsx,tsx,py,java,go,cs,cpp,html}',
    '**/node_modules/**'
  );

  for (const file of files) {
    const doc = await vscode.workspace.openTextDocument(file);
    for (let i = 0; i < doc.lineCount; i++) {
      const line = doc.lineAt(i);
      const match = regex.exec(line.text);
      if (match) {
        // match[1] = tag, match[2] = due date, match[3] = severity, match[4] = comment text
        const tag = match[1].toUpperCase();
        const dueDateStr = match[2] || null;
        const severityMarker = match[3] || null;
        const text = match[4].trim();

        const severity = mapSeverity(severityMarker);
        const dueDate = parseDueDate(dueDateStr);

        // Compose label for display
        let label = `${tag}`;
        if (dueDateStr) {label += ` (Due: ${dueDateStr})`;}
        if (severityMarker) {label += ` [${severityMarker}]`;}
        label += `: ${text}`;

        todos.push(
          new TodoItem(
            label,                         // label
            file,                          // fileUri
            i,                             // line number
            severity,                      // severity (4th param)
            dueDate,                      // dueDate (5th param)
            false,                        // isDone (default false)
            vscode.TreeItemCollapsibleState.None, // collapsibleState (7th param)
            {
              command: 'taskaroo.openTask',
              title: '',
              arguments: [{ fileUri: file, line: i }],
            }
          )
        );
      }
    }
  }

  return todos;
}
