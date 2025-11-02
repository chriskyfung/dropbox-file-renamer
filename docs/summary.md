# SDLC Documents Summary

This document provides a high-level overview of the Software Development Life Cycle (SDLC) documents for the Dropbox File Renamer project. These documents are intended to provide a comprehensive guide for developers, outlining the project's requirements, design, and future direction.

This document provides a summary of the Software Development Life Cycle (SDLC) documents for the Dropbox File Renamer project.

## 1. Software Requirements Specification (SRS)

The SRS outlines the requirements for the application. Key requirements include:

- **Functional:**
  - Search for files in Dropbox using a user-defined query.
  - Batch rename files using regular expressions.
  - Handle paginated search results.
- **Non-Functional:**
  - Efficiently handle a large number of files.
  - Easy to configure and use.
  - Graceful error handling.

## 2. Design and Development Report (DDR)

The DDR describes the system architecture and design. Key aspects include:

- **Architecture:** A command-line Node.js application with two modes: configuration-based and interactive.
- **Components:** `index.js` (main logic with `commander.js`), `config.js` (user configuration), `.env` (API token).
- **Data Flow:** The application either reads a config file or prompts the user interactively, then searches, previews, and renames files via the Dropbox API.

## 3. Product Backlog

The backlog contains ideas for future development. Key features include:

- Search by tags.
- Search in multiple folders.
- Support for other cloud storage providers.

## 4. User Story Example

### Search for files by tags

**As a** user,
**I want to** be able to search for files based on their tags,
**so that** I can easily find and rename files that are organized with tags.
