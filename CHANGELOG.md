# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2026-04-07

### ⬆️ Dependencies

- Bump `lodash` from 4.17.21 to 4.18.1 (#24, #38)
- Bump `tar` from 7.5.2 to 7.5.11 (#22, #23, #26, #32, #33)
- Bump `re2` in the production-dependencies group (#21, #25, #29)
- Bump `dotenv` in the production-dependencies group (#27, #28)
- Bump `minimatch` and `brace-expansion` (#30, #31, #36)
- Bump `jest` in the development-dependencies group (#34)
- Bump `picomatch` from 2.3.1 to 2.3.2 (#35)
- Bump `word-wrap` and `js-yaml` in the production-dependencies group (#29, #37)

### ⚙️ Continuous Integration

- Bump `actions/checkout` from 5 to 6 (#20)
- Bump minimum Node.js version to 20.17.0 (#39)
- Add permissions block following security best practice (#40)

## [2.1.0] - 2025-11-18

### ✨ Features

- **cli**: Add `--config` option to allow using a custom configuration file.

### ✅ Testing

- Add new test suite (`runDefaultMode.test.js`) to cover default mode execution with both default and custom configurations.

### ♻️ Refactoring

- **core**: Replace hard-coded default config file name with a `DEFAULT_CONFIG_FILE` constant.
- **core**: Move `require` of config file inside `try...catch` block to handle file not found errors gracefully.

### ⬆️ Dependencies

- Bump `re2` in the production-dependencies group (#17)
- Bump `js-yaml` from 3.14.1 to 3.14.2 (#18)
- Add `glob` package version override (#19)

## [2.0.0] - 2025-11-03

### ⚠ BREAKING CHANGES

- **rename**: The syntax for backreferences in replacement strings has been changed from the standard `$1` to `{{1}}`. This is a security measure to prevent string replacement vulnerabilities. Users relying on the old backreference syntax will need to update their renaming rules.

### ✨ Features

- **rename**: Introduce a new, safer syntax for backreferences (`{{n}}`) in replacement strings to prevent potential string replacement vulnerabilities.
- **cli**: Add interactive mode for on-the-fly renaming with previews and confirmations.

### 📝 Documentation

- Update `README.md`, `GEMINI.md`, and other documentation to reflect the new `{{n}}` backreference syntax.
- Update `README.md` and all SDLC documents in `docs/` directory to reflect the new interactive feature and its usage.

### ✅ Testing

- Add a new test suite (`interactive.test.js`) for interactive workflow coverage.
- Update existing tests in `index.test.js`.

### ♻️ Refactoring

- Refactor core logic in `index.js` into `runDefaultMode` and `runInteractiveMode` for modularity.

## [1.4.0] - 2025-11-01

### ✨ Features

- **deps**: Add `re2` dependency to mitigate ReDoS vulnerabilities.
- **testing**: Add comprehensive tests for `RE2.replace` functionality.
- **testing**: Add unit tests for core functionality.

### 🐛 Bug Fixes

- **security**: Mitigate ReDoS vulnerability by using `re2` for regex processing.
- **core**: Correct typo in '0 items to rename' console log from "reanme" to "rename".

### ⚡️ Performance

- Pre-compile rename rule regex patterns with `RE2` to improve performance.

### ♻️ Refactoring

- **main**: Encapsulate script execution in a named `main()` function to improve modularity and testability.

### ⚙️ Continuous Integration

- **dependabot**: Configure dependency grouping for npm packages and enable weekly updates for GitHub Actions.
- Add a CI workflow to automate build and test processes across multiple Node.js versions (18, 20, 22, 24).

### 🔧 Chore

- **package.json**: Enhance test scripts for granular execution (`test:all`, `test:index`, `test:re2`).

### ⬆️ Dependencies

- Bump `jest` from 30.0.5 to 30.2.0.
- Bump `dotenv` from 17.2.1 to 17.2.3.

## [1.3.0] - 2025-08-03

### ✨ Features

- Introduce `config.js` for external configuration of search queries and rename rules.

### ♻️ Refactoring

- Modernize codebase by switching to `async/await` syntax in `index.js`.

### ✅ Testing

- Add Jest for automated testing and include initial tests for core functionality.

### ⬆️ Dependencies

- Bump `dotenv` from 16.0.3 to 17.2.1.

### 📝 Documentation

- Add a Code of Conduct.
- Add `GEMINI.md` for AI-assisted development guidance.
- Update documentation to reflect recent changes.
