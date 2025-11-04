# Batch Rename Multiple Dropbox Files using Dropbox API V2

This example uses [the Official Dropbox API V2 SDK for Javascript](https://github.com/dropbox/dropbox-sdk-js) to search and rename files.

## Installation 🛠️

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

## Usage

### Configuration-based Mode

This mode uses a configuration file to define the search query and renaming rules.

1.  **Configure your rules:**
    *   For basic usage, open the default `config.js` file and modify the `query` and `renameRules` to match your needs.
    *   Alternatively, you can create your own configuration file and use the `--config` option to specify its path. This is useful for managing multiple renaming tasks.

    > #### Renaming Rules and Backreferences
    >
    > The `renameRules` in `config.js` use regular expressions to find and replace parts of a filename.
    >
    > To use parts of the original filename in the new name, you can use backreferences. This tool uses a custom `{{n}}` syntax for backreferences:
    >
    > *   `{{0}}` refers to the entire matched string.
    > *   `{{1}}`, `{{2}}`, etc., refer to the 1st, 2nd, etc., capture group from your regular expression.
    >
    > **Example:**
    >
    > To rename `image-001.jpg` to `photo-001.jpg`:
    >
    > ```javascript
    > // In config.js
    > renameRules: [
    >   {
    >     // Matches "image-001" and captures "001"
    >     regex: /image-(\d{3})/,
    >     // Replaces with "photo-" followed by the captured group
    >     replacement: 'photo-{{1}}'
    >   }
    > ]
    > ```
    >
    > **Note:** The standard `$1` syntax is not supported and will be treated as a literal string. This is a security measure to prevent unintended behavior.

2.  **Run the script:**
    *   To use the default `config.js`:
        ```bash
        npm start
        ```
    *   To use a custom configuration file:
        ```bash
        node index.js rename --config /path/to/your/config.js
        ```

### Interactive Mode

For a more guided experience without editing files, use the interactive mode.

1.  **Run the command with the interactive flag:**

    ```bash
    node index.js rename -i
    # or
    node index.js rename --interactive
    ```

2.  **Follow the prompts:** The application will ask for your search query and renaming rules directly in the terminal. It will then show you a preview of the changes and ask for confirmation before renaming any files.



## Testing 🧪

Run the test script using

```shell
npm test
```

## Examples

You can execute an example script using the following command in your terminal:

```shell
node ./example/[target-script-name].js
```

- `file_search_v2.js` - Searches for files and folders using the `/files/search_v2` and `/files/search/continue_v2` endpoints

- `list_folder.js` - Lists the items of a folder using the `/files/list_folder` and `/files/list_folder/continue` endpoints

## Learn More 📚

- [**Dropbox API Explorer**](https://dropbox.github.io/dropbox-api-v2-explorer)

  - [search_v2Switch](https://dropbox.github.io/dropbox-api-v2-explorer/#files_search_v2) - \[ [Docs](https://www.dropbox.com/developers/documentation/http/documentation#files-search) ]
  - [move_batch_v2](https://dropbox.github.io/dropbox-api-v2-explorer/#files_move_batch_v2) - \[ [Docs](https://www.dropbox.com/developers/documentation/http/documentation#files-move_batch) ]

- [Search Files Using the Dropbox API - Dropbox](https://dropbox.tech/developers/search-files-using-the-dropbox-api)

## Like my stuff?

Would you like to buy me a coffee? I would really appreciate it if you could support me for the development.

<a href="https://www.buymeacoffee.com/chrisfungky"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" target="_blank"></a>

## License

Distributed under the [GNU General Public License v3.0](LICENSE)