require('dotenv').config()

const prompt = require('prompt');
const { Dropbox } = require('dropbox'); // eslint-disable-line import/no-unresolved

// User-defined Parameters
const searchQurey = '.PNG .JPG .TIFF'; // String
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
    newString: '.jpg' // String
  }, {
    pattern: /.PNG/,  // regular expression
    newString: '.png' // String
  }
]

// Main 
prompt.start();

const dbx = new Dropbox({ accessToken: process.env.ACCESS_TOKEN });

dbx.filesSearchV2({ 'query': searchQurey, 'options': searchOptions })
  .then((response) => {
    const matches = response.result.matches;
    renameFiles(matches);
  })
  .catch((err) => {
    console.log(err);
  });

function renameFiles(files) {
  const entries = files.map(file => {
    const filename = file.metadata.metadata.name;
    let newFileName = filename;
    renameRules.forEach(rule => {
      newFileName = newFileName.replace(rule.pattern, rule.newString);
    })
    const oldPath = file.metadata.metadata.path_display;
    const newPath = oldPath.replace(filename, newFileName);
    if (newFileName !== filename) {
      return {
        from_path: oldPath,
        to_path: newPath
      }
    };
  }).filter(x => x);
  dbx.filesMoveBatchV2({ entries: entries} )
    .then((response) => {
      JSON.stringify(response);
    })
}
