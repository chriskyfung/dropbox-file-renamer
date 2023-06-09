/**
 * Searches for files and folders
 * 
 * Documentation: https://www.dropbox.com/developers/documentation/http/documentation#files-search
 * 
 * Required Scope: files.metadata.read
 * 
 */

require('dotenv').config()

const prompt = require('prompt');
const { Dropbox } = require('dropbox'); // eslint-disable-line import/no-unresolved

// User-defined Parameters
const searchQurey = 'cat'; // String (max_length=1000)
const searchOptions = {
  'file_status': 'active', // String ('active' or 'deleted', defaults to 'active')
  'filename_only': false, // Boolean
  'max_results': 20, // UInt64(min=1, max=1000)
  'file_categories': ['image'], // (Optional) List of FileCategory: 'image', 'document', 'pdf', 'spreadsheet', 'presentation', 'audio', 'video', 'folder', 'paper', and 'others'
  'file_extensions': ['jpg', 'png'], // (Optional) List of String
  'order_by': 'relevance', // (Optional) String ('relevance' or 'last_modified_time', defaults to 'relevance')
  'path': '/Folder' // (Optional) String(pattern='(/(.|[\r\n])*)?|id:.*|(ns:[0-9]+(/.*)?)')
}

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

function processResponse(response) {
  // Output the value of `path_display` for each search result
  const json = response.result;
  console.log(json.matches.map(m => m.metadata.metadata.path_display));
  // Check if there is next page
  if (json.has_more) {
    // Fetches the next page of search results
    dbx.filesSearchContinueV2({ "cursor": json.cursor })
      .then(response => processResponse(response))
  }
}
