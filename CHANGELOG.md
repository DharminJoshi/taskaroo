# Change Log

All notable changes to the "taskaroo" extension will be documented in this file.


## [Unreleased]

## [v0.0.2] - 2025-08-16

### Added
- Brand new extension icon for better visual identity in the marketplace and sidebar
- Support for detecting pre-existing `TODO`, `FIXME`, `HACK`, `URGENT` comments in workspace files
- Auto-refreshing of the TODO tree when files are created or deleted
- Status bar now dynamically displays the number of TODOs in the workspace
- Refresh button added to the Taskaroo explorer view title for quick TODO list refresh

### Changed
- Improved regex logic in parser to support custom tags and optional metadata like due dates and severity
- Enhanced CodeLens integration for improved navigation and inline TODO visibility
- Refactored `TodoTreeProvider`; now exposes public methods for external components

### Fixed
- Fixed issue where TODOs written directly as comments (e.g., `// TODO: something`) did not appear in the tree
- Resolved ESLint warnings related to missing curly braces in `todoParser.ts`

### Other
- Minor code clean-up and improved documentation comments

## [v0.0.1] - 2025-07-13
- Initial release
