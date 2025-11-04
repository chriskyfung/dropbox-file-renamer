# Software Requirements Specification (SRS)

## 1. Introduction

This document outlines the requirements for the Dropbox File Renamer, a Node.js application that allows users to batch rename files in their Dropbox account.

### 1.1. Purpose

The purpose of this document is to provide a detailed description of the requirements for the Dropbox File Renamer. It will serve as the foundation for the design, development, and testing of the application, ensuring that the final product meets the specified needs.

### 1.2. Project Scope

The project aims to provide a user-friendly command-line interface (CLI) for renaming files based on user-defined rules. The application will interact with the Dropbox API to search for and rename files, offering both a configuration-driven mode and an interactive prompt-based mode.

### 1.3. Definitions, Acronyms, and Abbreviations

- **API**: Application Programming Interface
- **CLI**: Command-Line Interface
- **DDR**: Design and Development Report
- **SRS**: Software Requirements Specification

## 2. Overall Description

### 2.1. Product Perspective

The Dropbox File Renamer is a standalone Node.js application that interacts with the Dropbox API. It is designed to be run from the command line and can be operated either through a local configuration file or via an interactive series of prompts.

### 2.2. Product Functions

-   **Configuration-based Mode**:
    -   Search for files in a Dropbox account using a query specified in a configuration file (`config.js` by default).
    -   Allow specifying a custom configuration file via a `--config` command-line option.
    -   Rename files based on regular expression rules defined in the configuration file.
-   **Interactive Mode**:
    -   Prompt the user for a search query.
    -   Prompt the user for one or more renaming rules.
    -   Display a preview of the changes before execution.
    -   Require user confirmation before renaming files.
-   **General**:
    -   Handle pagination of search results.
    -   Provide feedback to the user on the status of the renaming process.

### 2.3. User Characteristics

The target user is someone who uses Dropbox and needs to perform batch file renaming.
-   Users comfortable with editing configuration files and basic regular expressions can use the configuration-based mode.
-   Users who prefer a guided experience without editing files can use the interactive mode.

### 2.4. Constraints

-   The user must have a Dropbox account and be able to create a Dropbox application to obtain an access token.
-   The application requires Node.js to be installed on the user's machine.

### 2.5. Assumptions and Dependencies

-   The user has a stable internet connection.
-   The Dropbox API is available and functioning correctly.
-   The application depends on the `dropbox`, `dotenv`, `prompt`, and `commander` npm packages.

## 3. Specific Requirements

### 3.1. Functional Requirements

#### 3.1.1. File Search

-   The application shall be able to search for files in the user's Dropbox account using a user-defined query.
-   The search shall support advanced search operators as defined by the Dropbox API.
-   The search shall be able to handle a large number of results through pagination.

#### 3.1.2. File Renaming (Configuration-based)

-   The application shall be able to rename files based on a set of regular expression rules defined in a configuration file.
-   The application shall use `config.js` by default.
-   The application shall allow the user to specify a custom configuration file using the `--config` command-line option.
-   The renaming rules shall be applied to the search results.
-   The application shall provide feedback to the user on the success or failure of each renaming operation.

#### 3.1.3. Interactive Mode

-   The application shall provide an interactive mode accessible via a CLI flag (`-i` or `--interactive`).
-   The interactive mode shall prompt the user to enter a search query.
-   The interactive mode shall prompt the user to enter at least one renaming rule, consisting of a regular expression and a replacement pattern.
-   The replacement pattern shall support the safe backreference syntax `{{n}}`.
-   The interactive mode shall allow the user to enter multiple renaming rules.
-   Before executing the rename, the application shall display a preview of the files that will be renamed, showing the original and new filenames.
-   The application shall require explicit user confirmation (e.g., "yes/no") before proceeding with the rename operation.

### 3.2. Non-Functional Requirements

#### 3.2.1. Performance

- The application shall be able to handle a large number of files without significant performance degradation.
- The application shall make efficient use of the Dropbox API to avoid rate limiting.

#### 3.2.2. Usability

- The application shall be easy to configure and run from the command line.
- The application shall provide clear and concise feedback to the user.

#### 3.2.3. Reliability

- The application shall be able to handle errors gracefully and provide informative error messages.
- The application shall be able to recover from network errors and continue processing.


