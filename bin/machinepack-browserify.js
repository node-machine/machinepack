#!/usr/bin/env node

/**
 * Module dependencies
 */

var Path = require('path');
var yargs = require('yargs');
var program = require('commander');
var MPBrowserify = require('machinepack-browserify');
var Filesystem = require('machinepack-fs');

program
  .usage('[options]')
  .parse(process.argv);


// Build CLI options
var cliOpts = yargs.argv;
delete cliOpts._;
delete cliOpts.$0;


// Bundle the machinepack and its dependenies into a single JavaScript file for use on the client.
MPBrowserify.bundleMachinepack({
  path: process.cwd()
}).exec({
  // An unexpected error occurred.
  error: function(err) {
    console.error('An error occurred preparing this machinepack for the browser:\n',err.stack);
  },
  // OK.
  success: function (code) {

    var destPath = Path.resolve(cliOpts.destination||'./for-browser.js');

    // Generate a file on the local filesystem using the specified utf8 string as its contents.
    Filesystem.write({
      destination: destPath,
      string: code,
      force: true
    }).exec({
      // An unexpected error occurred.
      error: function(err) {
        console.error('An error occurred writing the result script:\n',err.stack);
      },
      // OK.
      success: function() {
        console.log('New JavaScript file which exposes a browser-ready version of this pack has been created at "%s".',destPath);
        console.log('To load onto page, just include w/ normal <script> tag, e.g.');
        console.log('<script type="text/javascript" src="./for-browser.js"></script>');
        console.log();
        console.log('For usage information, see:\nhttp://node-machine.org/machinepack-browserify/bundle-machinepack');
      }
    });

  }
});
