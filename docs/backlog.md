# Product Backlog

This document contains a list of potential features, improvements, and ideas for future development of the Dropbox File Renamer.

## Features

- **Search by Tags**: As a user, I want to be able to search for files based on their tags, so that I can easily find and rename files that are organized with tags.
- **Search in Multiple Folders**: As a user, I want to be able to specify a list of folders to search in, so that I can limit my search to specific areas of my Dropbox.
- **Interactive Mode**: As a user, I want to be able to run the application in an interactive mode, so that I can be prompted for the search query and renaming rules instead of editing the configuration file.
- **Support for Other Cloud Storage Providers**: As a user, I want to be able to use the application with other cloud storage providers, such as Google Drive or OneDrive, so that I can manage files across different platforms.

## Improvements

- **Improved Error Handling**: As a developer, I want to improve the error handling in the application, so that it can gracefully handle issues such as invalid access tokens or network errors and provide more informative error messages to the user.
- **File Statistics Report**: As a user, I want to generate a report with statistics about my files so that I can better understand their composition. The report could include:
  - **File Count per Tag**: A breakdown of how many files are associated with each tag.
  - **File Count per Extension**: A count of files grouped by their file extension (e.g., .jpg, .pdf, .docx).
  - **File Size Distribution**: Statistics on file sizes, such as average, median, largest, and smallest file sizes.
  - **Image Dimensions**: For image files, provide statistics on their dimensions (e.g., average width and height).

## Research/Ideas

- **AI-Powered Image Renaming**: Explore using AI services (like computer vision APIs) to automatically suggest or apply new filenames for images based on their visual content. For example, an image of a cat could be renamed `cat-on-sofa-2025.jpg`.
- **N-gram Analysis for Advanced Search**: Investigate using n-gram analysis of filenames and content to provide more intelligent and flexible search capabilities, helping users find files even with partial or misspelled queries.