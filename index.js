require('dotenv').config()

const path = require('path');
const prompt = require('prompt');
const { Dropbox } = require('dropbox');
const safe = require('safe-regex');

// User-defined Parameters
const { query, searchOptions, renameRules } = require('./config');

// Main 
async function main() {
  try {
    prompt.start();

    const dbx = new Dropbox({accessToken: process.env.ACCESS_TOKEN});

    let response = await dbx.filesSearchV2({ query, 'options': searchOptions });
    await processResponse(dbx, response);

  } catch (error) {
    console.error(error);
  }
}

if (require.main === module) {
  main();
}

/**
 * Processes the response from the Dropbox API, handling pagination and calling the rename function.
 * @param {Dropbox} dbx - The Dropbox API object.
 * @param {Object} response - JSON response from the Search and SearchContinue V2 APIs.
 */
async function processResponse(dbx, response) {
  let currentResponse = response;
  while (true) {
    const json = currentResponse.result;
    // List the items to be renamed
    const filteredItems = filterMatches(json.matches);
    // Rename the items in the list
    await renameFiles(dbx, filteredItems);

    // Check if there is next page
    if (json.has_more) {
      // Fetches the next page of search results
      try {
        currentResponse = await dbx.filesSearchContinueV2({ "cursor": json.cursor });
      } catch (err) {
        console.log(err);
        break;
      }
    } else {
      break;
    }
  }
}

/**
 * Applies the renaming rules to the search results and finds out if any items need to be renamed.
 * @param {Object[]} items - The `matches` from the search results.
 * @returns {Object[]} List of the old and new path of the items to be renamed.
 */
function filterMatches(items) {
  return items
    .map((item) => {
      // Extract the name and path from each search result
      const name = item.metadata.metadata.name;
      const path = item.metadata.metadata.path_display;

      // Generate the new name and new path
      let newName = name;
      renameRules.forEach(rule => {
        if (!safe(rule.pattern)) {
          console.error(`Skipping unsafe regex pattern: ${rule.pattern}`);
          return;
        }
        newName = newName.replace(rule.pattern, rule.newString);
      })
      const newPath = path.replace(name, newName);

      return { from_path: path, to_path: newPath };
    })
    // filter and return only the items need to be renamed by checking if any case insensitive changes
    .filter((mapped) => mapped.from_path.toLowerCase() !== mapped.to_path.toLowerCase());
}

/**
 * Renames the items by calling the MoveBatch V2 API.
 * @param {Dropbox} dbx - The Dropbox API object.
 * @param {Object[]} itemsToRename - List of renaming items.
 */
async function renameFiles(dbx, itemsToRename) {
  if (itemsToRename.length <= 0) {
    console.log("0 items to rename");
    return;
  }

  try {
    // Submit a job
    const response = await dbx.filesMoveBatchV2({ entries: itemsToRename });
    // Output the job status when checkProgress() returns a fulfilled Promise
    console.log("\nStart to rename the following queries:");
    const result = await checkProgress(dbx, response.result.async_job_id, itemsToRename);
    console.log(""); // Output an empty line
    result.entries.forEach((entry, i) => {
      if (entry[".tag"] === "success") {
        // Output a success message with the updated pathname
        console.log(
          `Successfully renamed the ${entry.success[".tag"]} "${path.dirname(
            entry.success.path_display
          )}/${entry.success.name}"`
        );
      } else if (entry[".tag"] === "failure") {
        // Output a failure message with the original pathname
        console.log(`Failed to rename "${itemsToRename[i].from_path}".`);
      } else {
        // Output an error message from the JSON response if got something other than a success or failure
        console.error("Unknown status: " + JSON.stringify(entry));
      }
    });
  } catch (err) {
    console.error(err);
  }
}

/**
 * Checks the progress of a MoveBatch job.
 * @param {Dropbox} dbx - The Dropbox API object.
 * @param {String} jobId - Job ID returned from the MoveBatch V2 API.
 * @param {Object[]} items - List of renaming items.
 * @returns {Promise<Object>} A promise that resolves with the job status.
 */
async function checkProgress(dbx, jobId, items) {
  // Output the path, current name and new name of each renaming item
  items.forEach((entry) => {
    console.log(`\npath: ${path.dirname(entry.from_path)}`)
    console.log(`"${path.basename(entry.from_path)}" --> "${path.basename(entry.to_path)}"`);
  })

  while (true) {
    try {
      const response = await dbx.filesMoveBatchCheckV2({ async_job_id: jobId });

      if (response.result['.tag'] === 'complete') {
        return { '.tag': 'complete', 'entries': response.result.entries };
      } else if (response.result['.tag'] !== 'in_progress') {
        throw response.result;
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = {
  processResponse,
  filterMatches,
  renameFiles,
  checkProgress
};
