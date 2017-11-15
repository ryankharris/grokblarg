#!/usr/bin/env node
"use strict";

// function processUpdateV2(fileName, title, keywords) {
//   title = title || "";
//   keywords = keywords || [];
//   gbLib.promiseToUpdatePost(fileName, title, keywords).then(
//     result => {
//       let msg = `updated post with file name: "${fileName}"`;
//       msg += title ? `, title: "${title}"` : "";
//       msg += keywords ? `, keywords: ${keywords}` : "";
//       console.log(msg);
//     },
//     result => {
//       console.log(result);
//     }
//   );
// } // end processUpdateV2

async function main() {
  const gbLib = require("../lib/grokblarg-lib");
  const path = require("path");
  const commander = require("commander");
  let store = {};

  try {
    store = await gbLib.loadConfigAndVersion(store);
  } catch (e) {
    console.log(`Error: ${e}`);
  }

  const grokblargArgs = gbLib.getGrokblargArgs(commander, store);
  store.outputPath = path.normalize(grokblargArgs.output + path.sep);
  store.sourcePath = path.normalize(grokblargArgs.source + path.sep);

  if (grokblargArgs.init) {
    // init() result is not used
    gbLib.init(store);
  } else if (grokblargArgs.create) {
    // processCreateV2() result is not used
    gbLib.processCreateV2(
      store,
      grokblargArgs.create,
      grokblargArgs.title,
      grokblargArgs.keywords
    );
    // } else if (grokblargArgs.update) {
    //   processUpdate(grokblargArgs.update, grokblargArgs.title, grokblargArgs.keywords)
  } else {
    gbLib.generateStaticContent(store);
  }
} // end main

main(); // execute main body
