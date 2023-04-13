require('dotenv').config()

const prompt = require('prompt');
const { Dropbox } = require('dropbox'); // eslint-disable-line import/no-unresolved

prompt.start();

const dbx = new Dropbox({ accessToken: process.env.ACCESS_TOKEN });

dbx.filesListFolder({ path: '/Uploaded' }) // Use '' for listing the root directory
.then((response) => {
  const folders = response.result.entries;
  folders.forEach(folder => {
    console.log(folder.name);
  });
})
.catch((err) => {
  console.log(err);
});
