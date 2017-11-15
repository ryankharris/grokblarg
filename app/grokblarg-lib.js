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

// 'production' exports
exports.init = init;
exports.generateStaticContent = generateStaticContent;
exports.promiseToGetConfig = promiseToGetConfig;
exports.promiseToLoadVersion = promiseToLoadVersion;
exports.promiseToCreatePost = promiseToCreatePost;
exports.promiseToUpdatePost = promiseToUpdatePost;
exports.itExists = itExists;

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
@desc an async fire-n-forget method which loads config and writes an example post into posts/
@param {string} sourcePath to the source markdown files
*/
function writeExamplePost(sourcePath) {
  let customDate = getFormattedDate();

  function success(results) {
    let config = results[0];
    let version = results[1];
    let examplePostContent = `<!-- @meta
Title: grokblarg example post
Author: ${config.author}
Keywords: blog, markdown
Created: ${customDate}
Updated: ${customDate}
Version: ${version}
-->


## Summary
Grokblarg is a static-blog-site generator
* The rest
* is up to
* __you!__
`;

    return fs.writeFile(
      sourcePath + EXAMPLE_POST_PATH,
      examplePostContent,
      err => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(
          `Initialized source directory: ${sourcePath} with example post`
        );
      }
    );
  } // end success

  function failure(results) {
    throw results;
  } // end failure

  Promise.all([promiseToGetConfig(), promiseToLoadVersion()]).then(
    success,
    failure
  );
} // end writeExamplePost

/**
@desc create source directory if it doesn't exist
@param {string} sourcePath to the source markdown files
*/
function createSourceDir(sourcePath) {
  fs.mkdir(sourcePath, err => {
    if (err) {
      console.error(err);
      return;
    }
    writeExamplePost(sourcePath);
  });
} // createSourceDir

/**
FIXME
*/
function createOutputDir(path) {
  fs.mkdir(path, err => {
    if (err) {
      console.error(err);
      return;
    }
  });
} // end createOutputDir

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
FIXME
*/
function createPostFile(sourcePath, fileName, title, keywords) {
  return Promise.all([promiseToGetConfig(), promiseToLoadVersion()]).then(
    results => {
      let customDate = getFormattedDate();
      let config = results[0];
      let version = results[1];
      let postContent = `<!-- @meta
Title: ${title}
Author: ${config.author}
Keywords: ${keywords.join(" ")}
Created: ${customDate}
Updated: ${customDate}
Version: ${version}
-->


## Summary
_your content here..._
`;

      return fs.writeFile(sourcePath + fileName, postContent, err => {
        if (err) {
          throw err;
        }
      });
    }
  );
} // end createPostFile

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
FIXME
*/
function promiseToCreatePost(sourcePath, fileName, title, keywords) {
  fileName = verifyMdExtension(fileName);
  let boundCreatPostFile = createPostFile.bind(
    null,
    sourcePath,
    fileName,
    title,
    keywords
  );

  return promisePathDoesNotExist(sourcePath + fileName).then(
    boundCreatPostFile,
    result => {
      return sourcePath + fileName + " already exists.";
    }
  );
} // end promiseToCreatePost

/**
@desc returns a promise intended to be consumed by async/await pattern
@param {string} path of the file to test
@return {Object} promise, resolved with true, rejected with false
*/
function itExists(path) {
  return new Promise((resolve, reject) => {
    fs.access(
      path,
      fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK,
      err => {
        if (err) {
          reject(false);
        }
        resolve(true);
      }
    );
  });
} // itExists

/**
FIXME
*/
function promiseToUpdatePost(fileName, title, keywords) {} // end promiseToUpdatePost

/**
FIXME
*/
function init(sourcePath) {
  let boundCreateSourceDir = createSourceDir.bind(null, sourcePath);
  createPathIfNoneExists(sourcePath, boundCreateSourceDir);
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
function promiseToGenerateIndexHtml(tenNewestEntries, targetPath) {
  function success(result) {
    let config = result;
    let md = "# " + config.blogName + "\n\n";

    tenNewestEntries.forEach(entry => {
      md += `- _${entry.updated}_ [${entry.title}](./${entry.fileName} "${
        entry.title
      }")\n`;
    });

    md += "\n\n";

    // TODO convert md -> html
    // write html to targetPath/index.html
    let html = convertMarkdownToHtml(md);
    fs.writeFile(targetPath + "index.html", html, err => {
      if (err) {
        throw err;
      }
      return true;
    });
  } // end success

  // return Promise.all([promiseToGetConfig(), promiseToLoadVersion()]).then(success)
  return promiseToGetConfig().then(success);
} // end promiseToGenerateIndexHtml

/**
 */
function promiseToGenerateKeywordsHtml(keywordMap, targetPath) {
  return new Promise((resolve, reject) => {});
} // end promiseToGenerateKeywordsHtml

/**
FIXME
*/
function generateStaticContent(sourcePath, targetPath) {
  fs.access(
    sourcePath,
    fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK,
    err => {
      if (err) {
        console.log(
          sourcePath +
            " does not exist. Run `grokblarg -i` to create it. Then add some posts in it."
        );
        return;
      }

      let boundCreateOutputDir = createOutputDir.bind(null, targetPath);
      createPathIfNoneExists(targetPath, boundCreateOutputDir);

      let tableOfContents = []; // collection of post objects
      let keywordDict = {}; // key-value, keys are keywords, values are collection of related posts
      let boundParseSourceMarkdown = parseSourceMarkdown.bind(
        null,
        sourcePath,
        tableOfContents,
        keywordDict,
        targetPath
      );
      let promises = [];

      function success(results) {
        // console.log(`Processed ${results.length} source files`)
        // console.log('keywordDict')
        // console.log(keywordDict)
        // console.log('tableOfContents')
        // console.log(tableOfContents)

        // TODO generate the index.html main page static-content, write to targetPath
        // sort toc newest->oldest inplace
        tableOfContents.sort(tocEntriesNewestToOldest);
        // get top 10 entries
        // let tenNewestEntries = tableOfContents.slice(0, 10)
        // promiseToGenerateIndexHtml(tenNewestEntries, targetPath)
        // promiseToGenerateIndexHtml(tableOfContents, targetPath)
        // .then(
        //   result => {console.log('hurray!')},
        //   result => {console.log('doh!')}
        // )
        // .then(promiseToGenerateKeywordsHtml)
        // .then(promiseToGenerateSearchHtml)
        // .catch(result => {
        //   throw 'generateStaticContent() failed with error: ' + result
        // })
        let boundPromiseToGenerateIndexHtml = promiseToGenerateIndexHtml.bind(
          null,
          tableOfContents,
          targetPath
        );
        // let boundPromiseToGenerateKeywordsHtml = promiseToGenerateKeywordsHtml.bind(null, keywordDict, targetPath)
        // let boundPromiseToGenerateSearchHtml = promiseToGenerateSearchHtml.bind(null, ...)
        Promise.all([boundPromiseToGenerateIndexHtml()]).then(
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

      fs.readdir(sourcePath, (err, files) => {
        if (err) {
          console.error(err);
          return;
        }

        // filter out non-.md files
        let filteredFiles = files.filter(fileName => {
          return path.extname(fileName) === ".md";
        });

        if (filteredFiles.length === 0) {
          console.log(sourcePath + " does not contain any posts. Exiting.");
          return;
        }

        console.log(`generating static-content in: ${targetPath}`);
        // collect promises to parse each source file
        promises = filteredFiles.map(boundParseSourceMarkdown);
        Promise.all(promises).then(success, failure);
      });
    }
  );
} // end generateStaticContent
