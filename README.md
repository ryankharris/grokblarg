# grokblarg
grokblarg is a static-blog-content generator.

The intent of the author is to use the generated content with github pages, similar in concept to Jekyll, but much simpler. You can obviously use the generated content for whatever you wish.

## Basic usage
* Install Node.js configure on your PATH.

* Clone or download grokblarg. Within the cloned folder, run:


    node app/grokblarg.js -i


That will create the `grokblarg.json` config file and the defaultSourcePath `posts/` if they don't already exist, and write an examplePost.md to the `posts/` folder.

* Now run the generation process with:


    node app/grokblarg.js

That will read each .md source file from `posts/`, generate an associated .html file for each, generate an index.html, and write everything to the default `output/` folder. Open the `output/index.html` in a web-browser to inspect the results.


## Running grokblarg CLI commands
Display help:

    node app/grokblarg -h

Display grokblarg version (it is capital 'V'):

    node app/grokblarg -V

Initialize installation folder, creating config `grokblarg.json` and `posts/` path:

    node app/grokblarg -i

Generate content using default arguments from `grokblarg.json` config (when `grokblarg.json` is first created, the defaultSourcePath is `./posts/` and defaultOutputPath is `./output/`):

    node app/grokblarg

Generate content with output folder argument (customOutputDirPath will be created if it doesn't exist):

    node app/grokblarg.js -o customOutputDirPath

Generate content with source folder argument (customSourceDirPath is not generated by this command. Use `--init` to generate a source folder path):

    node app/grokblarg.js -s customSourceDirPath

Generate content with source and output arguments:

    node app/grokblarg.js -s customSourceDirPath -o customOutputDirPath

Generate a new post template file in the default source path. The `--create` requires the `--title` option. It can make use of the `--keywords` option. newPostFileName in the example below can include the `.md` extension or leave it off.

    node app/grokblarg.js -c newPostFileName -t "A new post!"
    or
    node app/grokblarg.js -c newPostFileName -t "A new post!" -k "blog markdown grokblarg"


## Advanced usage
Having followed the 'Basic usage' instructions above, let me explain my grokblarg process in greater detail.

- Opening the `grokblarg.json` config, you will the following:


    "author": "Your Name Here",
    "blogName": "My grokblarg Blog",
    "defaultOutputPath": "./output/",
    "defaultSourcePath": "./posts/"

- Alter the `author` and `blogName` accordingly. `blogName` is used to generate the title of your blog in the index.html output.
- Alter the defaultSourcePath and defaultOutputPath to your desired locations, and preferably use absolute paths to avoid having to troubleshoot any strange behavior on your system. My config might look like:


    "author": "Ryan K Harris",
    "blogName": "Ryan's Blog",
    "defaultOutputPath": "/abs/path/to/ryankharris.github.io",
    "defaultSourcePath": "/abs/path/to/local/sourceRepo"

In my case, both local paths to ryankharris.github.io and sourceRepo are local clones of repos. This is so that when I add new post content to my local sourceRepo, I can commit and push to the remote. When I generate new static-blog-content using grokblarg, it is written to my local ryankharris.github.io clone, and I can again, commit and push to the remote, which will update the github pages.

- Now create a new source post with:


    node app/grokblarg.js -c "newPost" -t "My new post"

Now open that post file `newPost.md` in an editor, and you will see something similar to:


    <!-- @meta
    Title: My new post
    Author: Ryan K Harris
    Keywords:
    Created: 21Oct2017
    Updated: 21Oct2017
    Version: 0.3.1
    -->


    ## Summary
    _your content here..._

Now, edit to your heart's content. grokblarg makes use of [marky-markdown](https://www.npmjs.com/package/marky-markdown "marky-markdown") for converting markdown to html, so refer to that page for allowed features and syntax.

- Generate your output with:

    node app/grokblarg.js

You should see the converted posts and generated index.html in the specified output folder.

## Metadata explanation
grokblarg relies on the markdown source posts in your sourcePath including metadata with certain properties. Here is an example of the metadata grokblarg uses and expects:

    <!-- @meta
    title: my blog post
    created: 19Oct2017
    updated: 19Oct2017
    keywords: blog grokblarg fun
    version: 0.2.0
    -->

The opening tag `<!-- @meta` and closing tag `-->` are based on the [js-parse-markdown-metadata](https://www.npmjs.com/package/js-parse-markdown-metadata "js-parse-markdown-metadata") module (also by this author). It expects each metadata property to be on it's own line as a key-value pair separated by a ':'. Only the first ':' is used to split the line, subsequent colons are allowed within the value of a property.

Metadata properties are added to a post file generated using the `--create` command. Title, created, updated, and keywords may all be edited by hand and that is an expected usage pattern. Version is not used at the moment, but is expected to be maintained by the system.

Feel free to alter your title, updated date, and add keywords as you wish. New metadata properties may be added in the future in newer versions as needed.

## Running unit-tests
`npm t -s`  
`npm run jasmine test/unit/*`  
`npm run jasmine test/unit/<file-name>`  
