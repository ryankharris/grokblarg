'use strict'

const POSTS_PATH = './posts/'
const EXAMPLE_POST_PATH = './posts/examplePost.md'
const CONFIG_PATH = './grokblarg.json'
const PACKAGE_PATH = './package.json'
const OUTPUT_PATH = './output/'
const fs = require('fs')
const path = require('path')
const mdMeta = require('js-parse-markdown-metadata')
const marky = require('marky-markdown')
const ENV = process.env.NODE_ENV || 'development'

// 'production' exports
exports.OUTPUT_PATH = OUTPUT_PATH
exports.init = init
exports.generateStaticContent = generateStaticContent
exports.promiseToLoadVersion = promiseToLoadVersion
exports.promiseToCreatePost = promiseToCreatePost
exports.promiseToUpdatePost = promiseToUpdatePost

// additional 'test' ENV exports
if (ENV === 'test') {
  exports.getFormattedDate = getFormattedDate
  exports.parseKeywords = parseKeywords
  exports.parseTableOfContents = parseTableOfContents
}


/**
FIXME
*/
function getFormattedDate () {
  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  let today = new Date()
  let d = today.getDate().toString()
  let m = months[today.getMonth()]
  let y = today.getFullYear().toString()
  if (d.length === 1) {
    d = '0' + d
  }
  return d + m + y
} // end getFormattedDate


/**
@desc load config file and resolve promise with it
@return {Object} promise
*/
function promiseToGetConfig () {
  return new Promise((resolve, reject) => {
    fs.readFile(CONFIG_PATH, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(JSON.parse(data))
    })
  })
} // end promiseToGetConfig


/**
@desc load semantic-version from package.json
@return {Object} promise
*/
function promiseToLoadVersion () {
  return new Promise((resolve, reject) => {
    fs.readFile(PACKAGE_PATH, 'utf8', (err, data) => {
      if (err) {
        console.log('error?')
        reject(err)
      }
      let packageJson = JSON.parse(data)
      resolve(packageJson.version)
    })
  })
} // end promiseToLoadVersion


/**
@desc an async fire-n-forget method which loads config and writes an example post into posts/
*/
function writeExamplePost () {
  let customDate = getFormattedDate()

  function success (results) {
    let config = results[0]
    let version = results[1]
    let examplePostContent = `<!-- @meta
Title: grokblarg example post
Author: ${config.author}
Keywords: blog, markdown
Created: ${customDate}
Updated: ${customDate}
Version: ${version}
-->


# Welcome to Grokblarg
Grokblarg is a static-blog-site generator
* The rest
* is up to
* __you!__
`

    return fs.writeFile(EXAMPLE_POST_PATH, examplePostContent, (err) => {
      if (err) {
        console.error(err)
        return
      }
    })
  } // end success

  function failure (results) {
    throw results
  } // end failure

  // promiseToGetConfig().then(success, failure)
  Promise.all([promiseToGetConfig(), promiseToLoadVersion()]).then(success, failure)

} // end writeExamplePost


/**
FIXME
*/
function createPostsDir () {
  fs.mkdir(POSTS_PATH, (err) => {
    if (err) {
      console.error(err)
      return
    }
    writeExamplePost()
  })
} // createPostsDir


/**
FIXME
*/
function createOutputDir(path) {
  fs.mkdir(path, (err) => {
    if (err) {
      console.error(err)
      return
    }
  })
} // end createOutputDir


/**
FIXME
*/
function createConfigFile () {
  let initConfig = {
    blogName: 'My Grokblarg Blog',
    author: 'Your Name Here'
  }

  // fileContent will include pretty spacing
  let fileContent = JSON.stringify(initConfig, null, '\t')

  fs.writeFile(CONFIG_PATH, fileContent, (err) => {
    if (err) {
      console.error(err)
      return
    }
  })
} // end createConfigFile


/**
FIXME
*/
function createPathIfNoneExists (path, callback) {
  fs.access(path, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK, (err) => {
    if (err) {
      callback()
    }
  })
} // end pathExists


/**
FIXME
*/
function createPostFile (fileName, title, keywords) {
  return Promise.all([promiseToGetConfig(), promiseToLoadVersion()]).then(
    results => {
      let customDate = getFormattedDate()
      let config = results[0]
      let version = results[1]
      let postContent = `<!-- @meta
Title: ${title}
Author: ${config.author}
Keywords: ${keywords.join(' ')}
Created: ${customDate}
Updated: ${customDate}
Version: ${version}
-->


# ${title}
your content here..._
`

      return fs.writeFile(POSTS_PATH + fileName, postContent, (err) => {
        if (err) {
          throw err
        }
      })
    }
  )
} // end createPostFile


/**
FIXME
*/
function verifyMdExtension (fileName) {
  let bareName = path.basename(fileName, '.md')
  return bareName + '.md'
} // end verifyMdExtension


/**
@desc a promise, returns true if path does NOT exist, false otherwise
@param {string} path to test
@return {boolean}
*/
function promisePathDoesNotExist (path) {
  return new Promise((resolve, reject) => {
    fs.access(path, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK, (err) => {
      if (err) {
        resolve(true)
      }
      reject(false)
    })
  })
} // end promisePathDoesNotExist

/**
FIXME
*/
function promiseToCreatePost (fileName, title, keywords) {
  fileName = verifyMdExtension(fileName)
  let boundCreatPostFile = createPostFile.bind(null, fileName, title, keywords)

  return promisePathDoesNotExist(POSTS_PATH + fileName).then(
    boundCreatPostFile,
    result => {
      return POSTS_PATH + fileName + ' already exists.'
    }
  )
} // end promiseToCreatePost


/**
FIXME
*/
function promiseToUpdatePost (fileName, title, keywords) {

} // end promiseToUpdatePost


function init () {
  console.log(`Initializing grokblarg`)
  createPathIfNoneExists(POSTS_PATH, createPostsDir)
  createPathIfNoneExists(CONFIG_PATH, createConfigFile)
} // end init


/**
@desc given a metadata object, looks for property 'keywords' and extracts to string[], applies trim() & toLowerCase()
@param {Object} metadata possibly containing the keywords for a source file
@return {string[]} of keywords
*/
function extractKeywords (metadata) {
  let keywords = []
  if (metadata.keywords) {
    keywords = metadata.keywords
                        .split(' ')
                        .map((kw) => {return kw.trim().toLowerCase()})
  }
  return keywords
} // extractKeywords


/**
FIXME
*/
function parseKeywords (keywordMap, fileName, metadata) {
  let keywords = extractKeywords(metadata)

  keywords.forEach((kw) => {
    // make a property within keywordMap if it doesn't exist
    if (!keywordMap.hasOwnProperty(kw)) {
      keywordMap[kw] = [fileName]
    }

    // otherwise, search for existing fileName under the keyword property,
    // add it if it doesn't exist
    if (keywordMap[kw].indexOf(fileName) === -1) {
      keywordMap[kw].push(fileName)
    }
  })
} // end parseKeywords


/**
@desc extract data related to building toc-entry
@param {array} toc collection of toc-entries
@param {Object} metadata which includes properties related to entries
*/
function parseTableOfContents (toc, metadata) {
  // interested in: title, updated, and maybe keywords
  if (!metadata.title) {
    throw "Missing metadata 'title'"
  }
  if (!metadata.updated) {
    throw "Missing metadata 'updated'"
  }

  let entry = {
    title: metadata.title,
    updated: metadata.updated,
    keywords: extractKeywords(metadata)
  }
  toc.push(entry)
} // end parseTableOfContents


/**
@desc converts source markdown to html
@param {string|} markdown
@return {string} html
*/
function convertMarkdownToHtml (markdown) {
  return marky(markdown)
} // end convertMarkdownToHtml


/**
@desc given a fileName, performs all parsing and conversion from .md to .html
@param {Object[]} toc table-of-contents entries
@param {Object} keywordMap of keywords as keys, collection of related source-files as values
@param {string} fileName to process
@return {Object} promise
*/
function parseSourceMarkdown (toc, keywordMap, targetPath, fileName) {
  let parsed = {}

  return new Promise((resolve, reject) => {
    fs.readFile(POSTS_PATH + fileName, 'utf8', (err, data) => {
      if (err) {
        // throw err
        reject(err)
      }
      parsed = mdMeta.parse(data)
      parseKeywords(keywordMap, fileName, parsed.metadata)

      try {
        parseTableOfContents(toc, parsed.metadata)
      } catch (e) {
        reject(fileName + e)
      }

      let html = convertMarkdownToHtml(parsed.markdown)
      let extSep = fileName.lastIndexOf('.')
      let newFileName = fileName.slice(0, extSep) + '.html'
      fs.writeFile(targetPath + newFileName, html, (err) => {
        if (err) {
          reject(err)
        }
        resolve(newFileName)
      })
    })
  })

} // end parseSourceMarkdown


/**
FIXME
*/
function generateStaticContent (targetPath) {

  fs.access(POSTS_PATH, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK, (err) => {
    if (err) {
      console.log(POSTS_PATH + ' does not exist. Run `grokblarg -i` to create it. Then add some posts in it.')
      return
    }

    let boundCreateOutputDir = createOutputDir.bind(null, targetPath)
    createPathIfNoneExists(targetPath, boundCreateOutputDir)

    let tableOfContents = [] // collection of post objects
    let keywordDict = {} // key-value, keys are keywords, values are collection of related posts
    let boundParseSourceMarkdown = parseSourceMarkdown.bind(null, tableOfContents, keywordDict, targetPath)
    let promises = []

    function success (results) {
      console.log(`Processed ${results.length} source files`)
      console.log('keywordDict')
      console.log(keywordDict)
      console.log('tableOfContents')
      console.log(tableOfContents)
    } // end success

    function failure (result) {
      throw 'generateStaticContent() failed on Promise.all() with error: ' + result
    } // end failure

    fs.readdir(POSTS_PATH, (err, files) => {
      if (err) {
        console.error(err)
        return
      }

      if (files.length === 0) {
        console.log(POSTS_PATH + ' does not contain any posts. Exiting.')
        return
      }

      console.log(`generating static-content in: ${targetPath}`)
      // collect promises to parse each source file
      promises = files.map(boundParseSourceMarkdown)
      Promise.all(promises).then(success, failure)
    })

  })

} // end generateStaticContent
