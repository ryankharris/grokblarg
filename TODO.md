# Grokblarg TODO list

- [ ] develop e2e testing  

  NODE_ENV=test passed into e2e test execution script  
  config created/loaded when running e2e tests
  test/e2e/source created during e2e  
  test/e2e/source filled with samples  
  test/e2e/output created during e2e  
  test/e2e/output filled with generated output  

- [ ] consider refactor of certain promise-code to use async/await in order to cleanup
- [ ] Consolidate file-io to a few functions, to reduce # of functions with side-effects, in order to improve testability
- [ ] Revise parseKeywords() to support info the keywords.html page needs, i.e map of post entries, not just filenames
- [ ] Develop keywords.html page, add Keyword into top-level-nav
- [ ] Develop search.html page, add Search into top-level-nav
- [ ] Add -u refresh 'updated' date metadata for a post. Pull defaults from config
- [ ] Make use of path.sep in all path-related code to make it OS agnostic
- [ ] Live samples should be injectable with HTML/CSS/JavaScript demos.
- [ ] Internationalize: break language specific string-templates out. Add config option for language.
- [ ] Layout should be mobile-friendly
- [x] refactor so that grokblarg config and the version info are only loaded once during execution
- [x] Verify that -s combined with -c emits a warning if the provide sourcePath doesn't exist
- [x] update the -h help to indicate that -c makes use of the defaultSourcePath in grokblarg.json config
- [x] Fill out README
- [x] Add config property 'defaultSourcePath' for --source option
- [x] Add --source option allowing user to enter a source directory path
- [x] generation process should empty the targetPath first (no, because their are other hosting files in there)
- [x] If indicated output directory doesn't exist, create it as part of generateStaticContent
- [x] Add config property 'defaultOutputPath' and have grokblarg use that for default -o targetPath
- [x] Have the generateStaticContent function make use of config data
- [x] Make generated .html posts include the top menu, generated title, and dates in content
- [x] Main-page (index.html) displays posts in chronological (newest to oldest) order
- [x] Add -c create post command. Pull defaults from config
- [x] Verify grokblarg tests that posts/ exists and notifies the user otherwise.
- [x] Determine if 'Version' in post meta-data should be simple int or semantic-version. (semantic-version)
- [x] Verify writeExamplePost makes use of config.
- [x] Verify -o path args are normalized and folder separator is appended
- [x] Implement basic conversion .md -> .html
- [x] Implement meta-data extraction: build toc and keyword-map
- [x] Move markdown-metadata parsing to separate lib: js-parse-markdown-metadata
- [x] Implement cli -i option: creates 'posts' and grokblarg.json with initial examples
- [x] Get option parsing lib: Commander
- [x] Add Jasmine for unit-tests
- [x] Design file hierarchy for deployed cli-tool
- [x] Design file hierarchy for development of cli-tool
- [x] Add initial post for development
- [x] Create TODO list
