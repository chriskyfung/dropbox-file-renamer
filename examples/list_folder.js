/**
 * Starts returning the contents of a folder
 * 
 * Documentation: https://www.dropbox.com/developers/documentation/http/documentation#files-list_folder
 * 
 * Required Scope: files.metadata.read
 * 
 */

require('dotenv').config()

const prompt = require('prompt');
const { Dropbox } = require('dropbox'); // eslint-disable-line import/no-unresolved

// User-defined Parameters
const params = {
  'include_deleted': false, // Boolean (defaults to false)
  'include_mounted_folders': true, // Boolean (defaults to true)
  'include_non_downloadable_files': true, // Boolean (defaults to true)
  'path': '/Folder', // String(pattern="(/(.|[\r\n])*)?|id:.*|(ns:[0-9]+(/.*)?)"), use '' for listing the root directory
  'recursive': false, // Boolean (defaults to false)
  'limit': 2000 // (Optional) UInt32(min=1, max=2000)
}

// Main
prompt.start();

const dbx = new Dropbox({ accessToken: process.env.ACCESS_TOKEN });

dbx.filesListFolder(params)
.then((response) => {
  processResponse(response);
})
.catch((err) => {
  console.log(err);
});

function processResponse(response) {
  // Output the value of `path_display` for each search result
  const json = response.result;
  console.log(json.entries.map(e => e.name));
  // Check if there is next page
  if (json.has_more) {
    // Fetches the next page of search results
    dbx.filesListFolderContinue({ "cursor": json.cursor })
      .then(response => processResponse(response))
  }
}

