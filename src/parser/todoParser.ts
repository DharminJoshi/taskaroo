import * as vscode from 'vscode';
import { TodoItem } from '../types/todoTypes';

// Supported comment prefixes per language
const COMMENT_PREFIXES = ['//', '#', '--', ';', '<!--'];

// Escape special characters for regex
function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Map severity marker (! or ?) to severity level
function mapSeverity(marker: string | null): 'low' | 'medium' | 'high' {
  if (marker === '!') {
    return 'high';
  }
  if (marker === '?') {
    return 'low';
  }
  return 'medium';
}

// Parse a due date string (YYYY-MM-DD) into a Date object
function parseDueDate(dateStr: string | null): Date | undefined {
  if (!dateStr) {
    return undefined;
  }
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? undefined : date;
}

export async function parseTodosInWorkspace(): Promise<TodoItem[]> {
  const todos: TodoItem[] = [];

  if (!vscode.workspace.workspaceFolders) {
    return todos;
  }

  const config = vscode.workspace.getConfiguration('taskaroo');
  const customTags: string[] = config.get('customTags') || ['TODO', 'FIXME', 'HACK', 'URGENT'];

  // Join custom tags into a regex pattern
  const tagsPattern = customTags.map(escapeRegex).join('|');

  // Build flexible regex pattern
  const regex = new RegExp(
    `(?:${COMMENT_PREFIXES.map(escapeRegex).join('|')})\\s*` +  // Match comment prefix
    `(${tagsPattern})` +                                       // Match TODO/FIXME/etc.
    `(?:\\((\\d{4}-\\d{2}-\\d{2})\\))?` +                      // Optional due date in ()
    `([!?])?` +                                                // Optional severity marker
    `[:\\-]?\\s*(.*)?`,                                        // Optional colon/dash then comment
    'i'
  );

  const files = await vscode.workspace.findFiles(
    '**/*.{ts,js,jsx,tsx,py,java,go,cs,cpp,c,h,html,rb,rs,php,sh}',
    '**/node_modules/**'
  );

  for (const file of files) {
    const doc = await vscode.workspace.openTextDocument(file);

    for (let i = 0; i < doc.lineCount; i++) {
      const line = doc.lineAt(i);
      const match = regex.exec(line.text);

      if (match) {
        const tag = match[1].toUpperCase();
        const dueDateStr = match[2] || null;
        const severityMarker = match[3] || null;
        const text = (match[4] || '').trim();

        const severity = mapSeverity(severityMarker);
        const dueDate = parseDueDate(dueDateStr);

        let label = `${tag}`;
        if (dueDateStr) {
          label += ` (Due: ${dueDateStr})`;
        }
        if (severityMarker) {
          label += ` [${severityMarker}]`;
        }
        if (text) {
          label += `: ${text}`;
        }

        todos.push(
          new TodoItem(
            label,
            file,
            i,
            severity,
            dueDate,
            false,
            vscode.TreeItemCollapsibleState.None,
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
