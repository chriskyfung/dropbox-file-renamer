# User Story: Search for files by tags

**As a** user,
**I want to** be able to search for files based on their tags,
**so that** I can easily find and rename files that are organized with tags.

## Acceptance Criteria

- Given a user has files with tags in their Dropbox,
- When the user runs the application with a specific tag in the search query,
- Then the application should only return files that have that tag.
- The user should be able to specify the tag in the `config.js` file.
- The search should be case-insensitive.
