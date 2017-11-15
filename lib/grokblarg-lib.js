"use strict";

const EXAMPLE_POST_PATH = "examplePost.md";
const CONFIG_PATH = "./grokblarg.json";
const PACKAGE_PATH = "./package.json";
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
const fs = require("fs");
const path = require("path");
const mdMeta = require("js-parse-markdown-metadata");
const marky = require("marky-markdown");
const ENV = process.env.NODE_ENV || "development";
const util = require("util");
const asyncReadFile = util.promisify(fs.readFile);
const asyncWriteFile = util.promisify(fs.writeFile);
const asyncMkdir = util.promisify(fs.mkdir);
const asyncAccess = util.promisify(fs.access);
const asyncReaddir = util.promisify(fs.readdir);

// 'production' exports
exports.init = init;
exports.generateStaticContent = generateStaticContent;
exports.getGrokblargArgs = getGrokblargArgs;
exports.loadConfigAndVersion = loadConfigAndVersion;
exports.processCreateV2 = processCreateV2;

// additional 'test' ENV exports
if (ENV === "test") {
  exports.getFormattedDate = getFormattedDate;
  exports.parseKeywords = parseKeywords;
  exports.parseTableOfContents = parseTableOfContents;
  exports.parseDate = parseDate;
  exports.tocEntriesNewestToOldest = tocEntriesNewestToOldest;
}

/**
FIXME
*/
function list(words) {
  return words.split(" ");
} // end list

/**
FIXME
*/
function getFormattedDate() {
  // let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  let today = new Date();
  let d = today.getDate().toString();
  let m = months[today.getMonth()];
  let y = today.getFullYear().toString();
  if (d.length === 1) {
    d = "0" + d;
  }
  return d + m + y;
} // end getFormattedDate

/**
@desc takes a customFormatedDate and parses it into an array of numeric values, i.e. [day, month, year]
@param {string} cd to parse
@return {number[]} of the form [day, month, year]
*/
function parseDate(cd) {
  let cdVals = [];
  // numeric day
  cdVals.push(parseInt(cd.slice(0, 2), 10));

  // numeric month
  cdVals.push(months.indexOf(cd.slice(2, 5)));

  // numeric year
  cdVals.push(parseInt(cd.slice(5), 10));

  return cdVals;
} // end parseDate

/**
@desc a callback for the Array.prototype.sort() method
@param {Object} a is a tableOfContents entry
@param {Object} b is a tableOfContents entry
@return {number} -1 if a is older, 1 if a is newer, 0 if they are equal
*/
function tocEntriesNewestToOldest(a, b) {
  let cdVals1 = parseDate(a.updated);
  let cdVals2 = parseDate(b.updated);

  // compare years
  if (cdVals1[2] < cdVals2[2]) {
    return 1;
  } else if (cdVals1[2] > cdVals2[2]) {
    return -1;
  } else {
    // compare months
    if (cdVals1[1] < cdVals2[1]) {
      return 1;
    } else if (cdVals1[1] > cdVals2[1]) {
      return -1;
    } else {
      // compare days
      if (cdVals1[0] < cdVals2[0]) {
        return 1;
      } else if (cdVals1[0] > cdVals2[0]) {
        return -1;
      } else {
        return 0;
      }
    }
  }
} // end tocEntriesNewestToOldest

/**
@desc parses the CLI arguments using commander module
@param {Object} grokblarg is the commander object
@param {Object} store contains: config, version, paths, etc.
@param {Object} returns the grokblarg commander object augmented with parsed params.
*/
function getGrokblargArgs(grokblarg, store) {
  grokblarg
    .version(store.version)
    .option(
      "-c --create <filename>",
      `Creates a new post within source directory, defined in grokblarg.json config`
    )
    .option("-i --init", `Initializes source directory`)
    .option(
      "-k --keywords <words>",
      `Used with --create and --update commands to add/update keywords metadata`,
      list
    )
    .option(
      "-o --output <path>",
      `Specifies path where generated content should be written <${
        store.config.defaultOutputPath
      }>`,
      store.config.defaultOutputPath
    )
    .option(
      "-s --source <path>",
      `Specifies path to markdown source directory <${
        store.config.defaultSourcePath
      }>`,
      store.config.defaultSourcePath
    )
    .option(
      "-t --title <title>",
      `Used with --create and --update commands to add/update title metadata`
    )
    // .option('-u --update <filename>', `Update timestamp metadata of an existing post within 'posts' folder`)
    .parse(process.argv);

  return grokblarg;
} // getGrokblargArgs

/**
@desc load or create config file and resolve promise with it
@return {Object} promise
*/
function promiseToGetConfig() {
  function promiseToReadConfig() {
    return new Promise((resolve, reject) => {
      fs.readFile(CONFIG_PATH, "utf8", (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(JSON.parse(data));
      });
    });
  }

  return promisePathDoesNotExist(CONFIG_PATH).then(
    promiseToCreateConfigFile,
    promiseToReadConfig
  );
} // end promiseToGetConfig

/**
@desc load semantic-version from package.json
@return {Object} promise
*/
function promiseToLoadVersion() {
  return new Promise((resolve, reject) => {
    fs.readFile(PACKAGE_PATH, "utf8", (err, data) => {
      if (err) {
        console.log("error?");
        reject(err);
      }
      let packageJson = JSON.parse(data);
      resolve(packageJson.version);
    });
  });
} // end promiseToLoadVersion

/**
FIXME
*/
function loadConfigAndVersion(store) {
  let promises = [promiseToGetConfig(), promiseToLoadVersion()];
  return Promise.all(promises).then(
    results => {
      store.config = results[0];
      store.version = results[1];
      return store;
    },
    results => {
      throw results;
    }
  );
} // end loadConfigAndVersion

/**
@desc an async fire-n-forget method which loads config and writes an example post into posts/
@param {Object} store containing config, versions, paths, etc.
*/
async function writeExamplePostV2(store) {
  let customDate = getFormattedDate();

  let examplePostContent = `<!-- @meta
Title: grokblarg example post
Author: ${store.config.author}
Keywords: blog, markdown
Created: ${customDate}
Updated: ${customDate}
Version: ${store.version}
-->


## Summary
Grokblarg is a static-blog-site generator
* The rest
* is up to
* __you!__
`;

  try {
    const result = await asyncWriteFile(
      sourcePath + EXAMPLE_POST_PATH,
      examplePostContent
    );
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
} // end writeExamplePostV2

/**
@desc create directory if it doesn't exist
@param {string} path to create
*/
async function createDirV2(path) {
  try {
    const result = await asyncMkdir(path);
    return true;
  } catch (e) {
    // console.error(e);
    return false;
  }
} // createDirV2

/**
FIXME
*/
function promiseToCreateConfigFile() {
  return new Promise((resolve, reject) => {
    let initConfig = {
      author: "Your Name Here",
      blogName: "My grokblarg Blog",
      defaultOutputPath: "./output/",
      defaultSourcePath: "./posts/"
    };

    // fileContent will include pretty spacing
    let fileContent = JSON.stringify(initConfig, null, "\t");

    fs.writeFile(CONFIG_PATH, fileContent, err => {
      if (err) {
        reject(err);
      }
      resolve(initConfig);
    });
  });
} // end promiseToCreateConfigFile

/**
FIXME
*/
function createPathIfNoneExists(path, callback) {
  fs.access(
    path,
    fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK,
    err => {
      if (err) {
        callback();
      }
    }
  );
} // end pathExists

/**
@desc writes a new post file to disk
@param {Object} store contains: config, version, paths, etc.
@param {string} fileName to create
@param {string} title to write in post content
@param {string[]} keywords to write in post content
@return {boolean} true on success, false otherwise
*/
async function createPostFileV2(store, fileName, title, keywords) {
  let customDate = getFormattedDate();
  let postContent = `<!-- @meta
Title: ${title}
Author: ${store.config.author}
Keywords: ${keywords.join(" ")}
Created: ${customDate}
Updated: ${customDate}
Version: ${store.version}
-->


## Summary
_your content here..._
`;

  try {
    const result = await asyncWriteFile(
      store.sourcePath + fileName,
      postContent
    );
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
} // end createPostFileV2

/**
FIXME
*/
function verifyMdExtension(fileName) {
  let bareName = path.basename(fileName, ".md");
  return bareName + ".md";
} // end verifyMdExtension

/**
@desc a promise, returns true if path does NOT exist, false otherwise
@param {string} path to test
@return {boolean}
*/
function promisePathDoesNotExist(path) {
  return new Promise((resolve, reject) => {
    fs.access(
      path,
      fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK,
      err => {
        if (err) {
          resolve(true);
        }
        reject(false);
      }
    );
  });
} // end promisePathDoesNotExist

/**
@desc format fileName, verifies post doesn't already exist, then calls createPostFileV2
@param {Object} store contains: config, version, paths, etc.
@param {string} fileName to create
@param {string} title to write in post content
@param {string[]} keywords to write in post content
@return {boolean} true on success, false otherwise
*/
async function asyncCreatePost(store, fileName, title, keywords) {
  fileName = verifyMdExtension(fileName);

  return await createPostFileV2(store, fileName, title, keywords);
} // end asyncCreatePost

/**
@desc returns a promise intended to be consumed by async/await pattern
@param {string} path of the file to test
@return {Object} promise, resolved with true, rejected with false
*/
async function itExists(path) {
  const FS_CONSTANTS =
    fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK;

  try {
    const result = await asyncAccess(path, FS_CONSTANTS);
    return true;
  } catch (e) {
    // console.error(e);
    return false;
  }
} // itExists

/**
@desc create source path if it doesn't exist and populate with example post
@param {Object} store containing confi, version, paths, etc.
@return {boolean} true if it created sourcePath and wrote example post, false otherwise
*/
async function init(store) {
  let result = false;

  const sourceExists = await itExists(store.sourcePath);
  if (!sourceExists) {
    const created = await createDirV2(store.sourcePath);
    console.log("store");
    console.log(store);
    console.log("created");
    console.log(created);
    if (created) {
      result = await writeExamplePostV2(store);
      if (result) {
        console.log(
          `Initialized source directory: ${store.sourcePath} with example post`
        );
      }
    }
  } else {
    console.log(`Source directory ${store.sourcePath} already initialized`);
  }
  return result;
} // end init

/**
@desc given a metadata object, looks for property 'keywords' and extracts to string[], applies trim() & toLowerCase()
@param {Object} metadata possibly containing the keywords for a source file
@return {string[]} of keywords
*/
function extractKeywords(metadata) {
  let keywords = [];
  if (metadata.keywords) {
    keywords = metadata.keywords.split(" ").map(kw => {
      return kw.trim().toLowerCase();
    });
  }
  return keywords;
} // extractKeywords

/**
FIXME
*/
function parseKeywords(keywordMap, newFileName, metadata) {
  let keywords = extractKeywords(metadata);

  keywords.forEach(kw => {
    // make a property within keywordMap if it doesn't exist
    if (!keywordMap.hasOwnProperty(kw)) {
      keywordMap[kw] = [newFileName];
    }

    // otherwise, search for existing newFileName under the keyword property,
    // add it if it doesn't exist
    if (keywordMap[kw].indexOf(newFileName) === -1) {
      keywordMap[kw].push(newFileName);
    }
  });
} // end parseKeywords

/**
@desc extract data related to building toc-entry
@param {array} toc collection of toc-entries
@param {Object} metadata which includes properties related to entries
*/
function parseTableOfContents(toc, newFileName, metadata) {
  // interested in: title, updated, and maybe keywords
  if (!metadata.title) {
    throw "Missing metadata 'title'";
  }
  if (!metadata.updated) {
    throw "Missing metadata 'updated'";
  }

  let entry = {
    title: metadata.title,
    updated: metadata.updated,
    keywords: extractKeywords(metadata),
    fileName: newFileName
  };
  toc.push(entry);
} // end parseTableOfContents

/**
@desc converts source markdown to html
@param {string|} markdown
@return {string} html
*/
function convertMarkdownToHtml(markdown) {
  return marky(markdown);
} // end convertMarkdownToHtml

/**
@desc given a fileName, performs all parsing and conversion from .md to .html
@param {string} sourcePath to the source markdown files
@param {Object[]} toc table-of-contents entries
@param {Object} keywordMap of keywords as keys, collection of related source-files as values
@param {string} fileName to process
@return {Object} promise
*/
function parseSourceMarkdown(
  sourcePath,
  toc,
  keywordMap,
  targetPath,
  fileName
) {
  return new Promise((resolve, reject) => {
    fs.readFile(sourcePath + fileName, "utf8", (err, data) => {
      if (err) {
        // throw err
        reject(err);
      }
      let newFileName = path.basename(fileName, ".md") + ".html";
      let parsed = mdMeta.parse(data);
      // let nav = '[Home](./index.html "Return to the index") | [Keyword](./keywords.html "Keyword filtering") | [Search](./search.html "Search for text")\n\n'
      let nav = '[Home](./index.html "Return to the index")\n\n';
      let title = "# " + parsed.metadata.title + "\n\n";
      // let timestamps = '`Created:' + parsed.metadata.created + '` | `Updated:' + parsed.metadata.updated + '`\n\n'
      let enhancedMd = nav + title + parsed.markdown;
      // The following adds an horizontal-rule after top-left info
      // let enhancedMd = nav + title + timestamps + '---\n\n' + parsed.markdown

      parseKeywords(keywordMap, newFileName, parsed.metadata);

      try {
        parseTableOfContents(toc, newFileName, parsed.metadata);
      } catch (e) {
        reject(fileName + e);
      }

      let html = convertMarkdownToHtml(enhancedMd);

      fs.writeFile(targetPath + newFileName, html, err => {
        if (err) {
          reject(err);
        }
        resolve(newFileName);
      });
    });
  });
} // end parseSourceMarkdown

/**
@desc takes the 10 newest posts by 'updated' date and generates the index.html page
@param {Object[]} tenNewestEntries to include in the index.html page
@return {Object} promise
*/
async function promiseToGenerateIndexHtml(store, tocEntries) {
  let md = "# " + store.config.blogName + "\n\n";

  tocEntries.forEach(entry => {
    md += `- _${entry.updated}_ [${entry.title}](./${entry.fileName} "${
      entry.title
    }")\n`;
  });

  md += "\n\n";

  let html = convertMarkdownToHtml(md);
  const indexWrittenToOutputPath = await asyncWriteFile(
    store.outputPath + "index.html",
    html
  );
  if (!indexWrittenToOutputPath) {
    return false;
  }
  return true;
} // end promiseToGenerateIndexHtml

/**
 */
function promiseToGenerateKeywordsHtml(keywordMap, targetPath) {
  return new Promise((resolve, reject) => {});
} // end promiseToGenerateKeywordsHtml

/**
FIXME
*/
async function generateStaticContent(store) {
  const sourcePathExists = await itExists(store.sourcePath);
  if (!sourcePathExists) {
    console.log(
      `Sourcepath "${
        store.sourcePath
      }" does not exist, run "-i" option to create it`
    );
    return false;
  }

  // I don't test if outputPath already exists, I just try to create it
  // if it does exist and creation fails, no big deal.
  const createOutputDir = await createDirV2(store.outputPath);

  let tableOfContents = []; // collection of post objects
  let keywordDict = {}; // key-value, keys are keywords, values are collection of related posts
  let boundParseSourceMarkdown = parseSourceMarkdown.bind(
    null,
    store.sourcePath,
    tableOfContents,
    keywordDict,
    store.outputPath
  );
  let promises = [];
  let files = [];

  function success(results) {
    tableOfContents.sort(tocEntriesNewestToOldest);
    // let boundPromiseToGenerateKeywordsHtml = promiseToGenerateKeywordsHtml.bind(null, keywordDict, targetPath)
    // let boundPromiseToGenerateSearchHtml = promiseToGenerateSearchHtml.bind(null, ...)
    Promise.all([promiseToGenerateIndexHtml(store, tableOfContents)]).then(
      results => {
        console.log("Success");
      },
      results => {
        console.log("Failure");
      }
    );
  } // end success

  function failure(result) {
    throw "generateStaticContent() failed on Promise.all() with error: " +
      result;
  } // end failure

  try {
    files = await asyncReaddir(store.sourcePath);
  } catch (e) {
    console.error(e);
    return false;
  }

  // filter out non-.md files
  let filteredFiles = files.filter(fileName => {
    return path.extname(fileName) === ".md";
  });

  if (filteredFiles.length === 0) {
    console.error(
      `Source path "${store.sourcePath}" doesn't contain any posts`
    );
    return false;
  }

  console.log(
    `Generating static-content from "${store.sourcePath}" to "${
      store.outputPath
    }"`
  );
  // collect promises to parse each source file
  promises = filteredFiles.map(boundParseSourceMarkdown);
  Promise.all(promises).then(success, failure);
} // end generateStaticContent

/**
@desc create a post via cli
@param {Object} store contains: config, version, paths, etc.
@param {string} fileName to create
@param {string} title to write into file content
@param {string[]} keywords array to write into file content
@return {boolean} true on success, false otherwise
*/
async function processCreateV2(store, fileName, title, keywords) {
  if (!title) {
    console.log("--create requires --title option");
    return false;
  }

  const sourcePathExists = await itExists(store.sourcePath);
  if (!sourcePathExists) {
    console.error(`Error: source path "${store.sourcePath}" does not exist`);
    return false;
  }

  keywords = keywords || [];
  const postCreated = await asyncCreatePost(store, fileName, title, keywords);
  if (!postCreated) {
    console.error(`Post was not created, "${fileName}" may already exist`);
    return false;
  } else {
    console.log(
      `Post "${fileName}" with title "${title}" and keywords "${
        keywords
      }" was created`
    );
    return true;
  }
} // end processCreateV2
