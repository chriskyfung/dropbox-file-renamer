#!/usr/bin/env node
require('dotenv').config()

const path = require('path');
const prompt = require('prompt');
const { Dropbox } = require('dropbox');
const RE2 = require('re2');
const { Command } = require('commander');

const program = new Command();

// Main
/**
 * Main entry point of the CLI tool.
 * Initializes the Commander program, defines the 'rename' command, and parses command-line arguments.
 * Depending on the options, it runs either in interactive or default mode.
 * @returns {Promise<void>} A Promise that resolves when the program has finished parsing arguments and executing the command.
 */
async function main() {

  program
    .version('1.4.0')
    .description('A CLI tool to batch rename files in Dropbox.')
    .command('rename')
    .description('Rename files based on rules from config.js or interactive prompts.')
    .option('-i, --interactive', 'Run in interactive mode.')
    .action(async (options) => {
      if (options.interactive) {
        await runInteractiveMode();
      } else {
        await runDefaultMode();
      }
    });

  await program.parseAsync(process.argv);
}

if (require.main === module) {
  main();
}

/**
 * Runs the file renaming process in default mode, using configurations from `config.js`.
 * It reads search queries and rename rules from the config file, searches Dropbox, and processes the files.
 * @returns {Promise<void>} A Promise that resolves when the default mode execution is complete.
 */
async function runDefaultMode() {
  console.log('Running in default mode using config.js...');
  const { query, searchOptions, renameRules } = require('./config');
  const compiledRenameRules = compileRules(renameRules);
  
  try {
    const dbx = new Dropbox({accessToken: process.env.ACCESS_TOKEN});
    let response = await dbx.filesSearchV2({ query, 'options': searchOptions });
    await processResponse(dbx, response, compiledRenameRules, false);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Runs the file renaming process in interactive mode.
 * Prompts the user for a search query and rename rules, then searches Dropbox and processes the files.
 * @returns {Promise<void>} A Promise that resolves when the interactive mode execution is complete.
 */
async function runInteractiveMode() {
  console.log('Running in interactive mode...');
  prompt.start();

  try {
    const { query } = await prompt.get(['query']);
    const renameRules = [];
    while (true) {
      console.log("\nEnter a rename rule (leave pattern empty to finish):");
      const { pattern, newString } = await prompt.get(['pattern', 'newString']);
      if (!pattern) {
        break;
      }
      renameRules.push({ pattern, newString });
    }

    if (renameRules.length === 0) {
      console.log("No rename rules provided. Exiting.");
      return;
    }

    const compiledRenameRules = compileRules(renameRules);
    const dbx = new Dropbox({accessToken: process.env.ACCESS_TOKEN});
    let response = await dbx.filesSearchV2({ query });
    await processResponse(dbx, response, compiledRenameRules, true);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Compiles an array of rename rule objects into a format suitable for regex replacement.
 * Each rule's pattern string is converted into a RE2 regular expression object.
 * Invalid regex patterns are skipped and logged.
 * @param {Array<Object>} rules - An array of rule objects, each with a `pattern` (string) and `newString` (string).
 * @returns {Array<Object>} An array of compiled rule objects, each with a `pattern` (RE2 object) and `newString` (string).
 */
function compileRules(rules) {
  return rules.map(rule => {
    try {
      return {
        pattern: new RE2(rule.pattern),
        newString: rule.newString
      };
    } catch (e) {
      console.error(`Skipping invalid regex pattern: ${rule.pattern.toString()}`, e);
      return null;
    }
  }).filter(Boolean);
}

/**
 * Processes the response from a Dropbox file search, filters the matches, and initiates renaming.
 * It handles pagination for search results and, in interactive mode, prompts for user confirmation before renaming.
 * @param {Dropbox} dbx - The Dropbox API client instance.
 * @param {Object} response - The initial response object from `dbx.filesSearchV2`.
 * @param {Array<Object>} compiledRenameRules - An array of compiled rename rule objects.
 * @param {boolean} isInteractive - A boolean indicating whether the script is running in interactive mode.
 * @returns {Promise<void>} A Promise that resolves when all matching files have been processed and renamed (or cancelled).
 */
async function processResponse(dbx, response, compiledRenameRules, isInteractive) {
  let currentResponse = response;
  let allFilteredItems = [];

  while (true) {
    const json = currentResponse.result;
    const filteredItems = filterMatches(json.matches, compiledRenameRules);
    allFilteredItems.push(...filteredItems);

    if (json.has_more) {
      try {
        currentResponse = await dbx.filesSearchContinueV2({ "cursor": json.cursor });
      } catch (err) {
        console.error(`Error fetching next page: ${err.message}`);
        break;
      }
    } else {
      break;
    }
  }

  if (allFilteredItems.length === 0) {
    console.log("No files found to rename based on your criteria.");
    return;
  }

  if (isInteractive) {
    console.log(`\nFound ${allFilteredItems.length} file(s) to rename:`);
    allFilteredItems.forEach(item => {
      console.log(`  "${path.basename(item.from_path)}" --> "${path.basename(item.to_path)}"`);
    });

    const { confirm } = await prompt.get({
      name: 'confirm',
      description: 'Proceed with renaming? (y/n)',
      pattern: /^(y|n)$/i,
      default: 'n'
    });

    if (confirm.toLowerCase() === 'y') {
      await renameFiles(dbx, allFilteredItems);
      console.log("Renaming complete!");
    } else {
      console.log("Operation cancelled.");
    }
  } else {
    await renameFiles(dbx, allFilteredItems);
  }
}

/**
 * Filters a list of Dropbox file matches based on compiled rename rules.
 * It applies each rename rule to the file name to determine a potential new name and path.
 * Only files whose names would change after applying the rules are returned.
 * @param {Array<Object>} items - An array of file match objects from the Dropbox API.
 * @param {Array<Object>} compiledRenameRules - An array of compiled rename rule objects.
 * @returns {Array<Object>} An array of objects, each containing `from_path` and `to_path` for files that will be renamed.
 */
function filterMatches(items, compiledRenameRules) {
  return items
    .map((item) => {
      const name = item.metadata.metadata.name;
      const path_display = item.metadata.metadata.path_display;

      let newName = name;
      compiledRenameRules.forEach(rule => {
        try {
          newName = newName.replace(rule.pattern, rule.newString);
        } catch (e) {
          console.error(`Error applying regex pattern: ${rule.pattern.source}`, e);
        }
      });
      const newPath = path_display.replace(name, newName);

      return { from_path: path_display, to_path: newPath };
    })
    .filter((mapped) => mapped.from_path.toLowerCase() !== mapped.to_path.toLowerCase());
}

/**
 * Initiates the batch renaming of files in Dropbox.
 * It calls the Dropbox API to move/rename files and then monitors the job's progress.
 * @param {Dropbox} dbx - The Dropbox API client instance.
 * @param {Array<Object>} itemsToRename - An array of objects, each with `from_path` and `to_path` for the files to be renamed.
 * @returns {Promise<void>} A Promise that resolves when the renaming job is complete.
 */
async function renameFiles(dbx, itemsToRename) {
  if (itemsToRename.length <= 0) {
    console.log("0 items to rename");
    return;
  }

  try {
    const response = await dbx.filesMoveBatchV2({ entries: itemsToRename });
    console.log("\nStarting rename job...");
    const result = await checkProgress(dbx, response.result.async_job_id, itemsToRename);
    console.log(""); 
    result.entries.forEach((entry, i) => {
      if (entry[".tag"] === "success") {
        console.log(
          `Successfully renamed: "${itemsToRename[i].from_path}" to "${entry.success.name}"`
        );
      } else if (entry[".tag"] === "failure") {
        console.log(`Failed to rename "${itemsToRename[i].from_path}". Reason: ${JSON.stringify(entry.failure)}`);
      } else {
        console.error("Unknown status: " + JSON.stringify(entry));
      }
    });
  } catch (err) {
    console.error(`Error during rename operation: ${err.message}`);
  }
}

/**
 * Checks the progress of an asynchronous Dropbox job.
 * It polls the Dropbox API until the job is complete or fails.
 * @param {Dropbox} dbx - The Dropbox API client instance.
 * @param {string} jobId - The ID of the asynchronous job to check.
 * @param {Array<Object>} items - The array of items that were part of the job (used for context, though not directly in this function's logic).
 * @returns {Promise<Object>} A Promise that resolves with the final job result when complete.
 * @throws {Error} Throws an error if the job fails or an API error occurs.
 */
async function checkProgress(dbx, jobId, items) {
  console.log("Checking job progress...");
  while (true) {
    try {
      const response = await dbx.filesMoveBatchCheckV2({ async_job_id: jobId });

      if (response.result['.tag'] === 'complete') {
        return { '.tag': 'complete', 'entries': response.result.entries };
      } else if (response.result['.tag'] !== 'in_progress') {
        throw new Error(`Job failed with status: ${response.result['.tag']}`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = {
  program,
  main,
  runDefaultMode,
  runInteractiveMode,
  compileRules,
  processResponse,
  filterMatches,
  renameFiles,
  checkProgress
};