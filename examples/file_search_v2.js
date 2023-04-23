/**
 * Searches for files and folders
 * 
 * Documentation: https://www.dropbox.com/developers/documentation/http/documentation#files-search
 * 
 * Required Scope: files.metadata.read
 * 
 */

require('dotenv').config()

const async = require('async');
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

console.log(`\nStart searching for ${searchQurey}:\n`);

dbx.filesSearchV2({ 'query': searchQurey, 'options': searchOptions })
  .then((response) => {
    const json = response.result;

    // Output the value of `path_display` for each search result
    function processResponse(json) {
      const pathDisplays = json.matches.map(m => m.metadata.metadata.path_display);
      pathDisplays.forEach(p => console.log(p));
      return pathDisplays;
    }

    async function asyncCall(callback) {
      let offset = 0;
      let allResults = processResponse(json);
      
      let hasNextPage = json.has_more;
      let nextCursor = hasNextPage ? json.cursor : null;

      let results = [];

      while (hasNextPage) {
        if (hasNextPage && nextCursor) {
          const newResponse = await dbx.filesSearchContinueV2({ "cursor": nextCursor });
          const newJson = newResponse.result;
          results = processResponse(newJson);
          hasNextPage = newJson.has_more;
          nextCursor = newJson.has_more ? newJson.cursor : null;
          offset++;
        }
        allResults = allResults.concat(results);
      }
      return new Promise((resolve, reject) => {
        resolve({
          "results": {
            "path_displays": allResults
          }
        })
      })
    }

    try {
      asyncCall().then(resolved => {
        console.log(`\nTotal: ${resolved.results.path_displays.length} result(s)\n`);
      });
    } catch (err) {
      console.error(err);
    }
  })
  .catch((err) => {
    console.log(err);
  });
