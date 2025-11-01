# Design and Development Report (DDR)

## 1. Introduction

This document describes the design and development of the Dropbox File Renamer, a Node.js application for batch renaming files in a Dropbox account.

## 2. System Architecture

The application operates as a client that interacts with the external Dropbox API. It follows a simple, single-process architecture and runs as a command-line tool. Its primary function is to read a local configuration file, send requests to the Dropbox API based on that configuration, and then process the responses to rename files.

### 2.1. Components

- **`index.js`**: The main entry point of the application. It handles the overall workflow, including reading the configuration, searching for files, and renaming them.
- **`config.js`**: The configuration file where the user defines the search query and renaming rules.
- **`.env`**: A file that stores the user's Dropbox API access token.
- **`package.json`**: Defines the project dependencies and scripts.

### 2.2. Data Flow

1. The application starts and reads the configuration from `config.js`.
2. It then reads the Dropbox API access token from the `.env` file.
3. It uses the access token and search query to make a request to the Dropbox API's `filesSearchV2` endpoint.
4. The application processes the search results, applying the renaming rules to generate new filenames.
5. It then calls the Dropbox API's `filesMoveBatchV2` endpoint to rename the files.
6. The application polls the `filesMoveBatchCheckV2` endpoint to monitor the progress of the renaming job.
7. Finally, it outputs the results of the renaming operations to the console.

## 3. Detailed Design

### 3.1. `index.js`

- **`processResponse(dbx, response)`**: This function handles the pagination of the search results. It calls the `filterMatches` and `renameFiles` functions for each page of results.
- **`filterMatches(items)`**: This function applies the renaming rules to the search results and returns a list of files to be renamed.
- **`renameFiles(dbx, itemsToRename)`**: This function calls the `filesMoveBatchV2` endpoint to rename the files and then calls `checkProgress` to monitor the job.
- **`checkProgress(dbx, jobId, items)`**: This function polls the `filesMoveBatchCheckV2` endpoint to check the status of the renaming job and outputs the results to the console.

### 3.2. `config.js`

This file exports an object with the following properties:

- **`query`**: A string representing the search query.
- **`searchOptions`**: An object containing advanced search options.
- **`renameRules`**: An array of objects, where each object defines a regular expression pattern and a replacement string.

## 4. Development

### 4.1. Dependencies

- **`dropbox`**: The official Dropbox API V2 SDK for JavaScript.
- **`dotenv`**: A module that loads environment variables from a `.env` file.
- **`prompt`**: A module for creating interactive command-line prompts.
- **`jest`**: A delightful JavaScript Testing Framework with a focus on simplicity.

### 4.2. Testing

The project includes a test suite using Jest. The tests cover the main functionality of the application, including the `filterMatches` function.

## 5. Future Development

Future development could include the following:

- **Web Interface (Locally Hosted)**: To improve usability, a web-based graphical user interface (GUI) could be added. This would involve:
  - Integrating a lightweight web server using a framework like **Express.js**.
  - Creating a simple HTML form where users can input their search query and renaming rules, removing the need to edit `config.js`.
  - Displaying the results of the renaming operation in the browser.
  - The application would be started as a local server, and the user would interact with it through their web browser at an address like `http://localhost:3000`.
- **Improved Error Handling**: More robust error handling to handle cases such as invalid access tokens or network errors.
- **Interactive Mode**: An interactive mode that prompts the user for the search query and renaming rules.
- **Support for Other Cloud Storage Providers**: Adding support for other cloud storage providers such as Google Drive or OneDrive.
