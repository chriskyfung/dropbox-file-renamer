# Batch Rename Multiple Dropbox Files using Dropbox API V2

This example uses [the Official Dropbox API V2 SDK for Javascript](https://github.com/dropbox/dropbox-sdk-js) to search and rename files.

## Installation 🛠

1. Create an app via the [Developer Console](https://dropbox.com/developers/apps)

2. In the Developer Console, navigate to the **App Console** > *Your Application* > **Permissions** to add **`files.metadata.read`** and **`files.content.write`** permissions to your app scopes

3. Install from the source:

   ```shell
   git clone https://github.com/chriskyfung/dropbox-file-renamer.git
   cd dropbox-file-renamer
   npm install
   ```

4. Create a `.env` file in your project directory

5. Generate and copy the access token from the App Console to `.env` file, for example:

   ```plain
   ACCESS_TOKEN=your_access_token
   ```

## How to Use 🔰

1. Open the `index.js` file in Visual Studio Code

2. Modify the query string passed to the `filesSearchV2()` to search for your target files

3. Modify the regular expression and replacement for the `filename.replace()` methods to generate the new filenames of the matched files

4. Run the script using

   ```shell
   node index.js
   ```

   or

   ```shell
   npm start
   ```

## Examples

You can execute an example script using the following command in your terminal:

```shell
node ./example/[target-script-name].js
```

- `file_search_v2.js` - Searches for files and folders using the `/files/search_v2` and `/files/search/continue_v2` endpoints

- `ilst_folder.js` - Lists the items of a folder using the `/files/list_folder` and `/files/list_folder/continue` endpoints

## Learn More 📚

- [**Dropbox API Explorer**](https://dropbox.github.io/dropbox-api-v2-explorer)

  - [search_v2Switch](https://dropbox.github.io/dropbox-api-v2-explorer/#files_search_v2) - \[ [Docs](https://www.dropbox.com/developers/documentation/http/documentation#files-search) \]
  - [move_batch_v2](https://dropbox.github.io/dropbox-api-v2-explorer/#files_move_batch_v2) - \[ [Docs](https://www.dropbox.com/developers/documentation/http/documentation#files-move_batch) \]

- [Search Files Using the Dropbox API - Dropbox](https://dropbox.tech/developers/search-files-using-the-dropbox-api)

## Like my stuff?

Would you like to buy me a coffee? I would really appreciate it if you could support me for the development.

<a href="https://www.buymeacoffee.com/chrisfungky"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" target="_blank"></a>

## License

Distributed under the [GNU Affero General Public License v3.0](LICENSE)
