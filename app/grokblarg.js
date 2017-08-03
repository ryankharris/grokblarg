#!/usr/bin/env node
'use strict'

let grokblarg = require('commander')
const postsPath = './posts/'
const examplePostPath = './posts/examplePost.md'
const configPath = './grokblarg.json'
const outputPath = './output/'
const fs = require('fs')
const mdmeta = require('marked-metadata')
// console.log(mdmeta);

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

function writeExamplePost () {
  let customDate = getFormattedDate()
  let examplePostContent = `
  <!--
  Title: grokblarg example post
  Author: your name here
  Keywords: blog, markdown
  Created: ${customDate}
  Updated: ${customDate}
  Version: 0.1.0
  -->


  # Welcome to Grokblarg
  Grokblarg is a static-blog-site generator
  * The rest
  * is up to
  * __you!__
  `
  return fs.writeFile(examplePostPath, examplePostContent, (err) => {
    if (err) {
      console.error(err)
      return
    }
  })
} // end writeExamplePost

function createPostsDir () {
  fs.mkdir(postsPath, (err) => {
    if (err) {
      console.error(err)
      return
    }
    writeExamplePost()
  })
} // createPostsDir

function createOutputDir(path) {
  fs.mkdir(path, (err) => {
    if (err) {
      console.error(err)
      return
    }
  })
} // end createOutputDir

function createConfigFile () {
  let initConfig = {
    blogName: 'My Grokblarg Blog'
  }
  // fileContent will include pretty spacing
  let fileContent = JSON.stringify(initConfig, null, '\t')

  fs.writeFile(configPath, fileContent, (err) => {
    if (err) {
      console.error(err)
      return
    }
  })
} // end createConfigFile

function createPathIfNoneExists (path, callback) {
  fs.access(path, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK, (err) => {
    if (err) {
      callback()
    }
  })
} // end pathExists

function init () {
  console.log(`Initializing grokblarg`)
  createPathIfNoneExists(postsPath, createPostsDir)
  createPathIfNoneExists(configPath, createConfigFile)
} // end init

function parseSourceMarkdown (fileName) {
  console.log(fileName)
  let md = new mdmeta(postsPath + fileName)
  md.defineTokens('<!--', '-->')
  let meta = md.metadata()
  let content = md.markdown()
  console.log(`meta:\n${meta}\n`);
  console.log(`content:\n${content}\n`);
} // end parseSourceMarkdown

function generateStaticContent (targetPath) {
  console.log(`pretending to output static-content to: ${targetPath}`)
  let boundCreateOutputDir = createOutputDir.bind(null, targetPath)
  createPathIfNoneExists(targetPath, boundCreateOutputDir)

  let tableOfContents = []
  let keywordDict = {}

  fs.readdir(postsPath, (err, files) => {
    if (err) {
      console.error(err)
      return
    }
    files.forEach(parseSourceMarkdown)
  })

} // end generateStaticContent

grokblarg
  .version('0.1.0')
  .option('-i --init', `Initializes folder where grokblarg exists for content-generation`)
  .option('-o --output [path]', `Specifies where generated static-content should be written [${outputPath}]`, outputPath)
  .parse(process.argv)

// console.log('options passed:')
// if (grokblarg.init) {
//   console.log(' - init')
// }
// console.log(' - output path: %s', grokblarg.output)

if (grokblarg.init) {
  init()
} else {
  generateStaticContent(grokblarg.output)
}
