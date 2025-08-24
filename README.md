# 🧩 Taskaroo — Smart TODO & FIXME Manager for VS Code

![TypeScript](https://img.shields.io/badge/TypeScript-✓-blue) ![ESLint](https://img.shields.io/badge/Linted-✓-green) ![Mocha](https://img.shields.io/badge/Tested-Mocha-red)

A powerful and flexible VS Code extension that intelligently tracks, displays, and navigates through comment-based tasks like `TODO`, `FIXME`, `HACK`, and more.  
**Boost your code productivity** by managing your task comments in one smart place.

---

## 🎯 Features

- ✅ **Auto-detect TODOs**, FIXMEs, and other tags from code comments
- 🧩 **Custom Tags** support (e.g., `URGENT`, `HACK`, `NOTE`)
- 🌲 **Tree View Panel** in the Explorer for structured task navigation
- 🧭 **Quick Navigation** between next/previous tasks
- ➕ **Add TODO via Context Menu or Title Bar**
- 📦 **Export all tasks** to a file
- 🧼 **Mark as Done** with a custom prefix (`DONE`)
- 🧠 **Fully configurable** via `settings.json`

---

## 🛠️ Tech Stack

- **Language:** TypeScript
- **Framework:** Visual Studio Code API
- **Tooling:** Mocha + Chai (Testing), ESLint (Linting), ts-node (Dev)
- **Packaging:** VSCE (Visual Studio Code Extension CLI)

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js (v18+ recommended)
- VS Code
- `vsce` CLI (for publishing)

### 🔨 Installation

Clone the repo:

```bash
git clone https://github.com/DharminJoshi/taskaroo.git
cd taskaroo
npm install
```

Compile the extension:

```bash
npm run compile
```

Launch in VS Code (F5 or Run Extension from VS Code Debug tab).

---

## 💻 Usage

| Command                         | Description                                |
|---------------------------------|--------------------------------------------|
| `Taskaroo: Refresh Task List`   | Reload all TODOs and refresh the view      |
| `Taskaroo: Open Task`           | Open file and jump to task location        |
| `Taskaroo: Add New TODO`        | Insert a TODO comment into the current file|
| `Taskaroo: Export Tasks`        | Save all detected tasks to a file          |
| `Taskaroo: Navigate to Next`    | Jump to next TODO                          |
| `Taskaroo: Navigate to Previous`| Jump to previous TODO                      |

You can also right-click in the editor or file explorer for quick access.

---

## ⚙️ Configuration

In your `settings.json`:

```json
"taskaroo.customTags": ["TODO", "FIXME", "HACK", "URGENT"],
"taskaroo.groupByTag": true,
"taskaroo.donePrefix": "DONE",
"taskaroo.includePatterns": ["**/*.{ts,js,py,java,cpp,html}"],
"taskaroo.excludePatterns": ["**/node_modules/**", "**/.git/**"]
```

---

## 🧪 Running Tests

Taskaroo uses Mocha + ts-node for tests:

```bash
npm run test
```

---

## 📁 Folder Structure

```
taskaroo/
├── src/
│   ├── extension.ts             # Entry point of the extension
│   ├── provider/
│   │   └── todoTreeProvider.ts  # VS Code Tree Data Provider
│   ├── parser/
│   │   └── todoParser.ts        # Logic for scanning files and parsing tags
│   ├── commands/
│   │   └── registerCommands.ts  # Command registrations and implementations
│   ├── codelens/
│   │   └── todoCodeLensProvider.ts # Optional CodeLens support
│   ├── utils/
│   │   └── debounce.ts          # Utility functions like debouncing
│   └── tests/
│       ├── command.test.ts      # Command registration tests
│       └── parser.test.ts       # Parsing logic tests
├── out/                         # Compiled JavaScript output
├── package.json                 # Extension manifest, commands, settings
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project documentation
```

---

## 🧭 Roadmap

- [ ] Markdown export for tasks
- [ ] Task filters (by tag, file, priority)
- [ ] Inline annotations
- [ ] Git-aware task diffing
- [ ] Webview UI for custom task board

---

## ⚖️ License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for full details.

---

## 👨‍💻 Author

- **Developer:** Dharmin Joshi / DevKay  
- **Email:** info.dharmin@gmail.com  
- **LinkedIn:** [linkedin.com/in/dharmin-joshi-3bab42232](https://www.linkedin.com/in/dharmin-joshi-3bab42232/)  
- **GitHub:** [github.com/DharminJoshi](https://github.com/DharminJoshi)  

---

## 🤝​ Community & Support

Join our Discord community for live discussion, feedback, support, and updates:  
**[Discord Invite](https://discord.com/invite/TsChJGSwk6)**

---

Thank you for using **Taskaroo** 🧩  
_Keep your TODOs organized and your mind clutter-free!_
