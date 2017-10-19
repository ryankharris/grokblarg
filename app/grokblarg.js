#!/usr/bin/env node
'use strict'

const path = require('path')
const gbLib = require('./grokblarg-lib')
const grokblarg = require('commander')

gbLib.promiseToLoadVersion().then(
  version => {

    function list (words) {
      return words.split(' ')
    } // end list

    function processCreate (fileName, title, keywords) {
      if (!title) {
        console.log('--create requires --title option')
        return
      }

      keywords = keywords || []
      gbLib.promiseToCreatePost(fileName, title, keywords).then(
        result => {
          let msg = `created post with file name: "${fileName}", title: "${title}"`
          msg += (keywords)? `, keywords: ${keywords}`: ''
          console.log(msg)
        },
        result => {
          console.log(result)
        }
      )
    } // end processCreate

    function processUpdate (fileName, title, keywords) {
      title = title || ''
      keywords = keywords || []
      gbLib.promiseToUpdatePost(fileName, title, keywords).then(
        result => {
          let msg = `updated post with file name: "${fileName}"`
          msg += (title)? `, title: "${title}"`: ''
          msg += (keywords)? `, keywords: ${keywords}`: ''
          console.log(msg)
        },
        result => {
          console.log(result)
        }
      )
    } // end processUpdate

    grokblarg
      .version(version)
      .option('-c --create <filename>', `Creates a new post within 'posts' folder with required metadata`)
      .option('-i --init', `Initializes folder where grokblarg exists for content-generation`)
      .option('-k --keywords <words>', `Used with --create and --update commands to add/update keywords metadata`, list)
      .option('-o --output [path]', `Specifies relative-path where generated content should be written [${gbLib.OUTPUT_PATH}]`, gbLib.OUTPUT_PATH)
      .option('-t --title <title>', `Used with --create and --update commands to add/update title metadata`)
      .option('-u --update <filename>', `Update timestamp metadata of an existing post within 'posts' folder`)
      .parse(process.argv)

    let outputPath = path.normalize(grokblarg.output + path.sep)

    if (grokblarg.init) {
      gbLib.init()
    } else if (grokblarg.create) {
      processCreate(grokblarg.create, grokblarg.title, grokblarg.keywords)
    } else if (grokblarg.update) {
      processUpdate(grokblarg.update, grokblarg.title, grokblarg.keywords)
    } else {
      gbLib.generateStaticContent(outputPath)
    }
  },
  error => {
    console.log(error)
  }
)
