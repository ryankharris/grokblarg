#!/usr/bin/env node
'use strict'

let grokblarg = require('commander')

grokblarg
  .version('0.1.0')
  .option('-i --init', `Initializes folder where grokblarg exists for content-generation`)
  .option('-o --output [path]', `Specifies where generated static-content should be written [output]`, 'output')
  .parse(process.argv)

console.log('options passed:');
if (grokblarg.init) {
  console.log(' - init');
}
console.log(' - output path: %s', grokblarg.output);
