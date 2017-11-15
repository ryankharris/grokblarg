"use strict";

const gbLib = require("../../lib/grokblarg-lib");

describe("grokblarg-lib", function() {
  it("should parseKeywords", function() {
    let keywordMap = {};
    let f1 = "testFile1.md";
    let metadata1 = { keywords: "blog javascript fun grok blarg" };
    let f2 = "testFile2.md";
    let metadata2 = { keywords: "blog test functional blarg" };

    gbLib.parseKeywords(keywordMap, f1, metadata1);
    gbLib.parseKeywords(keywordMap, f2, metadata2);

    expect(keywordMap).toEqual({
      blog: ["testFile1.md", "testFile2.md"],
      javascript: ["testFile1.md"],
      fun: ["testFile1.md"],
      grok: ["testFile1.md"],
      blarg: ["testFile1.md", "testFile2.md"],
      test: ["testFile2.md"],
      functional: ["testFile2.md"]
    });
  });

  it("should extract title, updated, and keywords with parseTableOfContents", function() {
    let toc = [];
    let newFileName = "post.html";
    let metadata = {
      title: "A title",
      updated: "18Oct2017",
      keywords: "jasmine test awesome",
      other: "some other metadata",
      another: "even more useless metadata"
    };

    gbLib.parseTableOfContents(toc, newFileName, metadata);
    expect(toc).toEqual([
      {
        title: metadata.title,
        updated: metadata.updated,
        keywords: metadata.keywords.split(" "),
        fileName: newFileName
      }
    ]);
  });

  it('should throw error when parseTableOfContents finds missing metadata "title"', function() {
    let toc = [];
    let newFileName = "post.html";
    let metadata = {
      title: "",
      updated: "18Oct2017",
      keywords: "grok blarg",
      other: "ooooops",
      another: "fail?"
    };
    let boundParseTableOfContents = gbLib.parseTableOfContents.bind(
      null,
      toc,
      newFileName,
      metadata
    );

    expect(boundParseTableOfContents).toThrow("Missing metadata 'title'");
  });

  it('should throw error when parseTableOfContents finds missing metadata "updated"', function() {
    let toc = [];
    let newFileName = "post.html";
    let metadata = {
      title: "A title",
      updated: "",
      keywords: "grok blarg",
      other: "ooooops",
      another: "fail?"
    };
    let boundParseTableOfContents = gbLib.parseTableOfContents.bind(
      null,
      toc,
      newFileName,
      metadata
    );

    expect(boundParseTableOfContents).toThrow("Missing metadata 'updated'");
  });

  it("should parseDate", function() {
    let mockDate1 = "20Oct2017";
    let mockDate2 = "01Jan2016";
    let mockDate3 = "31Dec2015";
    let mockVals1 = gbLib.parseDate(mockDate1);
    let mockVals2 = gbLib.parseDate(mockDate2);
    let mockVals3 = gbLib.parseDate(mockDate3);

    expect(mockVals1).toEqual([20, 9, 2017]);
    expect(mockVals2).toEqual([1, 0, 2016]);
    expect(mockVals3).toEqual([31, 11, 2015]);
  });

  it("should tocEntriesNewestToOldest()", function() {
    let mockToc = [
      {
        title: "title2",
        updated: "01Jan2016",
        keywords: ["test", "date", "sort", "entry2"]
      },
      {
        title: "title3",
        updated: "31Dec2015",
        keywords: ["test", "date", "sort", "entry3"]
      },
      {
        title: "title1",
        updated: "20Oct2017",
        keywords: ["test", "date", "sort", "entry1"]
      }
    ];

    mockToc.sort(gbLib.tocEntriesNewestToOldest);
    expect(mockToc[0]).toEqual({
      title: "title1",
      updated: "20Oct2017",
      keywords: ["test", "date", "sort", "entry1"]
    });
    expect(mockToc[1]).toEqual({
      title: "title2",
      updated: "01Jan2016",
      keywords: ["test", "date", "sort", "entry2"]
    });
    expect(mockToc[2]).toEqual({
      title: "title3",
      updated: "31Dec2015",
      keywords: ["test", "date", "sort", "entry3"]
    });
  });
}); // end describe
