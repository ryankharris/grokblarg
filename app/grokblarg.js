'use strict'

function mungle (s = 'defaults') {
  return s
}

let x = `hi, I'm Grokblarg!`

console.log('relying on defaults gets you: ' + mungle())

console.log('passing args gets you: ' + mungle(x))
