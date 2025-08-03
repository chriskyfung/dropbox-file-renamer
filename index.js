require('dotenv').config()

const path = require('path');
const prompt = require('prompt');
const { Dropbox } = require('dropbox'); // eslint-disable-line import/no-unresolved

// User-defined Parameters
const searchQurey = '.jpg'; // String
const searchOptions = {
  'file_status': 'active', // String ('active' or 'deleted', defaults to 'active')
  'filename_only': true, // Boolean
  'max_results': 1000, // UInt64(min=1, max=1000)
  'file_categories': ['image'], // (Optional) List of FileCategory: 'image', 'document', 'pdf', 'spreadsheet', 'presentation', 'audio', 'video', 'folder', 'paper', and 'others'
  'file_extensions': ['jpg', 'png'], // (Optional) List of String
  'order_by': 'relevance', // (Optional) String ('relevance' or 'last_modified_time', defaults to 'relevance')
  'path': '/Folder' // (Optional) String(pattern='(/(.|[\r\n])*)?|id:.*|(ns:[0-9]+(/.*)?)')
}

const renameRules = [
  {
    pattern: /.JPG/, // regular expression
    newString: '.JPG.jpg' // String
  }, {
    pattern: /.PNG/,  // regular expression
    newString: '.PNG.png' // String
  }
]

// Main 
prompt.start();

const dbx = new Dropbox({ accessToken: process.env.ACCESS_TOKEN });

dbx.filesSearchV2({ 'query': searchQurey, 'options': searchOptions })
  .then((response) => {
    processResponse(response);
  })
  .catch((err) => {
    console.log(err);
  });

/**
 * @param {Object} response - JSON response from the Search and SearchContinue V2 APIs
 */
function processResponse(response) {
  const json = response.result;
  // List the items to be renamed
  const filteredItems = filterMatches(json.matches);
  // Rename the items in the list
  renameFiles(filteredItems);
  
  // Check if there is next page
  if (json.has_more) {
    // Fetches the next page of search results
    dbx.filesSearchContinueV2({ "cursor": json.cursor })
      .then((nextPage) => {
        processResponse(nextPage);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

/**
 * Apply the renaming rules to the search results and find out if any items need to be renamed
 * @param {Object} The `matches` from the search results
 * @returns {Object} List of the old and new path of the items to be renamed
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
        newName = newName.replace(rule.pattern, rule.newString);
      })
      const newPath = path.replace(name, newName);

      return { from_path: path, to_path: newPath };
    })
    // filter and return only the items need to be renamed by checking if any case insensitive changes
    .filter((mapped) => mapped.from_path.toLowerCase() !== mapped.to_path.toLowerCase());
}

/**
 * Rename the items by calling the MoveBatch V2 API
 * @param [Object] List of renaming items
 */
function renameFiles(itemsToRename) {
  if (itemsToRename.length <= 0) {
    console.log("0 items to reanme");
    return;
  }

  // Submit a job
  dbx
    .filesMoveBatchV2({ entries: itemsToRename })
    .then((response) => {
      // Output the job status when checkProgress() returns a fulfilled Promise
      console.log("\nStart to rename the following queries:");
      checkProgress(response.result.async_job_id, itemsToRename)
        .then((result) => {
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
        })
        .catch((err) => {
          console.error(err);
        });
    })
    .catch((err) => {
      console.log(err);
    })
}

/**
 * Returns a promise that resolves when the MoveBatchCheck V2 API returns a response with a complete tag
 * @param {String} jobId - Job ID returned from the MoveBatch V2 API
 * @param {Object} items - List of renaming items
 * @returns 
 */
function checkProgress(jobId, items) {
  // Output the path, current name and new name of each renaming item
  items.forEach((entry) => {
    console.log(`\npath: ${path.dirname(entry.from_path)}`)
    console.log(`"${path.basename(entry.from_path)}" --> "${path.basename(entry.to_path)}"`);
  })
  // Return a promise that resolves until the job complete, otherwise rejects with returning the API response
  return new Promise((resolve, reject) => {
    setTimeout(() =>{
      // Calling the MoveBatchCheck V2 with a time delay of 3 seconds
      dbx.filesMoveBatchCheckV2({ "async_job_id": jobId })
        .then((response) => {
          if (response.result['.tag'] === 'complete') {
            // Resolve the promise
            resolve({ '.tag': 'complete', 'entries': response.result.entries });
          } else if (response.result['.tag'] === 'in_progress') {
            // Continue to check the progress by recalling the function itself
            checkProgress(jobId, items)
              .then((resolved) => {
                resolve({ '.tag': 'complete', 'entries': resolved.entries });
              })
              .catch((err) => {
                console.log(err);
              })
          } else (
            // Reject the promise with returning the API response
            reject(response.result)
          )
        })
        .catch ((err) => {
          console.log(err);
        });
      }, 3000);
  })
}
