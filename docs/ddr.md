# Design and Development Report (DDR)

## 1. Introduction

This document describes the design and development of the Dropbox File Renamer, a Node.js application for batch renaming files in a Dropbox account.

## 2. System Architecture

The application operates as a client that interacts with the external Dropbox API. It runs as a command-line tool and supports two modes of operation:

-   **Configuration-based Mode**: Reads a local configuration file (`config.js` by default, or a custom file via the `--config` option) to perform batch renaming.
-   **Interactive Mode**: Guides the user through a series of prompts to define search and rename parameters on the fly.

### 2.1. Components

-   **`index.js`**: The main entry point of the application. It uses `commander.js` to parse command-line arguments and routes to the appropriate mode (default or interactive).
-   **`config.js`**: The default configuration file for the configuration-based mode.
-   **`.env`**: Stores the user's Dropbox API access token.
-   **`package.json`**: Defines project dependencies, including `dropbox`, `dotenv`, `commander`, and `prompt`.

### 2.2. Data Flow

#### Configuration-based Mode
1.  The application starts and reads the configuration from `config.js` or a custom file specified with the `--config` option.
2.  It reads the Dropbox API access token from the `.env` file.
3.  It uses the configuration to search for files via the Dropbox API.
4.  The application processes the results, applies renaming rules, and renames the files.
5.  It polls for job completion and outputs the results to the console.

#### Interactive Mode
1.  The user runs the application with the `-i` or `--interactive` flag.
2.  The application prompts the user for a search query.
3.  It enters a loop, prompting the user for one or more renaming rules (regex and replacement).
4.  The application searches for files based on the user's query.
5.  It displays a preview of the proposed file renames.
6.  The user is asked for confirmation to proceed.
7.  If confirmed, the application renames the files and reports the final status.

## 3. Detailed Design

### 3.1. `index.js`

The main script is now structured around `commander.js` and separates logic into distinct functions:

-   **`runDefaultMode()`**: Contains the logic for the original configuration-based renaming process.
-   **`runInteractiveMode()`**: Manages the interactive session, handling all user prompts, previews, and confirmation steps.
-   **`processResponse(dbx, response, compiledRenameRules)`**: Handles pagination of search results for both modes.
-   **`filterMatches(items, compiledRenameRules)`**: Applies renaming rules to search results. It uses a custom replacer function to safely handle backreferences in replacement strings. The supported syntax is `{{n}}` for capture groups, which prevents vulnerabilities associated with the standard `$` syntax.
-   **`renameFiles(dbx, itemsToRename)`**: Calls the `filesMoveBatchV2` endpoint and monitors the job.
-   **`checkProgress(dbx, jobId, items)`**: Polls the `filesMoveBatchCheckV2` endpoint to check the status of the renaming job.

### 3.2. `config.js`

This file remains the same, exporting an object with `query`, `searchOptions`, and `renameRules` for the configuration-based mode.

## 4. Development

### 4.1. Dependencies

-   **`dropbox`**: The official Dropbox API V2 SDK for JavaScript.
-   **`dotenv`**: Loads environment variables from a `.env` file.
-   **`commander`**: A framework for building command-line interfaces. Used to handle the `rename -i` command.
-   **`prompt`**: A module for creating interactive command-line prompts, used in the interactive mode.
-   **`jest`**: A JavaScript Testing Framework.

### 4.2. Testing

The project includes a test suite using Jest. The tests cover the main functionality of the application, including the `filterMatches` function and the new interactive mode logic.

## 5. Future Development

Future development could include the following:

-   **Web Interface (Locally Hosted)**: To improve usability, a web-based graphical user interface (GUI) could be added. This would involve:
    -   Integrating a lightweight web server using a framework like **Express.js**.
    -   Creating a simple HTML form where users can input their search query and renaming rules.
    -   Displaying the results of the renaming operation in the browser.
-   **Improved Error Handling**: More robust error handling to handle cases such as invalid access tokens or network errors.
-   **Support for Other Cloud Storage Providers**: Adding support for other cloud storage providers such as Google Drive or OneDrive.
