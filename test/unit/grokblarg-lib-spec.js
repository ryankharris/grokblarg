'use strict'

const gbLib = require('../../app/grokblarg-lib')

describe('grokblarg-lib', function () {

  it('should parseKeywords', function () {
    let keywordMap = {}
    let f1 = 'testFile1.md'
    let metadata1 = {keywords: 'blog javascript fun grok blarg'}
    let f2 = 'testFile2.md'
    let metadata2 = {keywords: 'blog test functional blarg'}

    gbLib.parseKeywords(keywordMap, f1, metadata1)
    gbLib.parseKeywords(keywordMap, f2, metadata2)

    expect(keywordMap).toEqual({
      blog: ['testFile1.md', 'testFile2.md'],
      javascript: ['testFile1.md'],
      fun: ['testFile1.md'],
      grok: ['testFile1.md'],
      blarg: ['testFile1.md', 'testFile2.md'],
      test: ['testFile2.md'],
      functional: ['testFile2.md']
    })
  })

  it('should extract title, updated, and keywords with parseTableOfContents', function () {
    let toc = []
    let metadata = {
      title: 'A title',
      updated: '18Oct2017',
      keywords: 'jasmine test awesome',
      other: 'some other metadata',
      another: 'even more useless metadata'
    }

    gbLib.parseTableOfContents(toc, metadata)
    expect(toc).toEqual([
      {
        title: metadata.title,
        updated: metadata.updated,
        keywords: metadata.keywords.split(' ')
      }
    ])
  })

  it('should throw error when parseTableOfContents finds missing metadata "title"', function () {
    let toc = []
    let metadata = {
      title: '',
      updated: '18Oct2017',
      keywords: 'grok blarg',
      other: 'ooooops',
      another: 'fail?'
    }
    let boundParseTableOfContents = gbLib.parseTableOfContents.bind(null, toc, metadata)

    expect(boundParseTableOfContents).toThrow("Missing metadata 'title'")
  })

  it('should throw error when parseTableOfContents finds missing metadata "updated"', function () {
    let toc = []
    let metadata = {
      title: 'A title',
      updated: '',
      keywords: 'grok blarg',
      other: 'ooooops',
      another: 'fail?'
    }
    let boundParseTableOfContents = gbLib.parseTableOfContents.bind(null, toc, metadata)

    expect(boundParseTableOfContents).toThrow("Missing metadata 'updated'")
  })

}) // end describe
