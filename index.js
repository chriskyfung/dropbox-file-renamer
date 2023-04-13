require('dotenv').config()

const prompt = require('prompt');
const { Dropbox } = require('dropbox'); // eslint-disable-line import/no-unresolved

// User-defined Parameters
const searchQurey = '.PNG .JPG .TIFF'; // String
const searchOptions = {
  'filename_only': true // Boolean
}

const renameRules = [
  {
    pattern: /.PNG/,  // regular expression
    newString: '.png' // String
  },
  {
    pattern: /.JPG/, // regular expression
    newString: '.jpg' // String
  },
  {
    pattern: /.TIFF/, // regular expression
    newString: '.tiff' // String
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
