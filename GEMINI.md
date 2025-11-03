# Dropbox File Renamer

This is a Node.js project that renames files in a Dropbox account using the Dropbox API v2.

**Author**: Chris K.Y. Fung

## Project Goal

The main goal of this project is to help the user batch rename files in their Dropbox. This involves two main steps:

1. Searching for files using a specific query.
2. Renaming the found files based on a regular expression replacement.

## Core Files

- `index.js`: This is the main script that contains the logic for searching and renaming files.
- `config.js`: This file contains the configuration for the script, including the search query and rename rules. This is the file that will be modified most often.
- `.env`: This file must be created by the user to store their Dropbox API access token. It should contain a line like `ACCESS_TOKEN=your_access_token`.
- `package.json`: Defines the project dependencies and scripts. The main dependency is the `dropbox` npm package.
- `index.test.js`: Contains the tests for `index.js`.

## How to Assist the User

The application now supports two modes: configuration-based and interactive.

### Configuration-based Mode

1.  **Understand the User's Goal:** Ask the user what files they want to rename and what the new naming scheme should be.
2.  **Modify `config.js`:**
    -   Update the `query` variable to match the user's search criteria.
    -   Update the regular expression and replacement string in the `renameRules` array to achieve the desired new filenames. When assisting with `renameRules`, be aware of the custom backreference syntax. Use `{{n}}` to refer to the nth capture group (e.g., `{{1}}`). `{{0}}` refers to the entire match. The standard `$n` syntax is not supported.
3.  **Guide the User on Running the Script:**
    -   Remind the user to create the `.env` file with their `ACCESS_TOKEN`.
    -   The script is run using `npm start` or `node index.js`.

### Interactive Mode

1.  **Guide the User to Start Interactive Mode:** Instruct the user to run `node index.js rename -i` or `node index.js rename --interactive`.
2.  **Explain the Prompts:** Inform the user that they will be prompted for the following information directly in the terminal:
    -   The search query.
    -   One or more renaming rules (regular expression and replacement string).
    -   Confirmation to proceed after seeing a preview of the changes.
3.  **Assist with Regex:** If the user needs help formulating the regular expression for a renaming rule, provide assistance. Remember to use the `{{n}}` syntax for backreferences.

-   **Provide Examples:** The `examples` directory contains scripts that demonstrate how to use the Dropbox API for searching and listing files. You can refer to these to help the user.

## Git Commits

**IMPORTANT:** All commits MUST follow the specified format. This is a strict requirement.

### Commit Message Format

**The most important rule is that all commits must be prefixed with a Gitmoji.**

The full format is:

`<emoji> <type>(<scope>): <subject>`

**Example of a good commit message:**

```
✨ feat(api): implement new search endpoint
```

**Example of a bad commit message (missing Gitmoji):**

```
feat(api): implement new search endpoint
```

- **Emoji**: A relevant emoji from the [Gitmoji convention](https://gitmoji.dev/) that describes the purpose of the commit. **This is mandatory.**
- **Type**: The type of change (e.g., `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`).
- **Scope**: The scope of the change (e.g., `api`, `ui`, `db`).
- **Subject**: A short, imperative-tense description of the change.

### Commit Message Body

If the subject line is not enough to explain the change, add a more detailed description in the commit message body. The body should explain the "what" and "why" of the change, not the "how".

### Commit Message Footer

The footer can be used to reference issues, pull requests, or breaking changes. For example:

`BREAKING CHANGE: The API now returns a different data structure.`

### Atomic Commits

Each commit should be atomic, meaning it should contain a single, complete change. This makes the git history easier to read and understand. Avoid bundling multiple unrelated changes into a single commit.

## Release Process

When creating a new release, use the `gh` command-line tool.

1.  **Create and push a new tag:**

    ```shell
    git tag -a vX.X.X -m "Version X.X.X" main
    git push origin vX.X.X
    ```

2.  **Create the release:**

    ```shell
    gh release create vX.X.X -t "vX.X.X" -n "$(cat CHANGELOG.md)"
    ```