#!/usr/bin/env node

/**
 * Module dependencies
 */

var path = require('path');
var _ = require('lodash');
var chalk = require('chalk');
var Machines = require('machinepack-machines');
var Filesystem = require('machinepack-fs');
var program = require('commander');
var gi = require('git-info');

program
.usage('[options]')
.parse(process.argv);


// IDEA: if a machine file exists in the machines folder, but is not in the package.json, add it?  not sure if this would actually be a good thing. probably as a different command...?

var packageJsonPath = path.resolve(process.cwd(), 'package.json');

// Ensure package.json file has proper `npm test` script and devDependency on `test-machinepack-mocha`:
Filesystem.read({
  source: packageJsonPath,
}).exec({
  // An unexpected error occurred.
  error: function(err) {
    console.error('Unexpected error occurred:\n', err);
  },
  // No file exists at the provided `source` path
  doesNotExist: function() {
    console.error('This is '+chalk.red('not a machinepack')+'.');
    console.error('Be sure and check that the package.json file has a valid `machinepack` property, or run `machinepack init` if you aren\'t sure.');
  },
  // OK.
  success: function(jsonString) {

    var jsonData;
    try {
      jsonData = JSON.parse(jsonString);
      jsonData.devDependencies = jsonData.devDependencies||{};
      jsonData.devDependencies['test-machinepack-mocha'] = '^0.2.2';
      jsonData.scripts = jsonData.scripts||{};
      jsonData.scripts.test = 'node ./node_modules/test-machinepack-mocha/bin/testmachinepack-mocha.js';
    }
    catch (e) {
      console.error('Unexpected error parsing or modifying package.json data:\n', e);
      return;
    }

    // While we're here, see if there's anything exciting in the git directory and
    // update the package.json file with the repo url if we can get it.
    gi('repository', function(err, repoInfo) {

      // Ignore errors-- just use the repo url if we can get it, otherwise ignore it.
      if (err) { }
      else {
        try {
          jsonData.repository = {
            type: 'git',
            url: repoInfo.repository
          };
        }
        catch (e) {}
      }

      Filesystem.writeJson({
        json: jsonData,
        destination: packageJsonPath,
        force: true
      }).exec({

        // An unexpected error occurred.
        error: function (err){
          console.error('Unexpected error occurred:\n', err);
        },

        // OK.
        success: function (){

          // Ensure tests exist for each machine (don't overwrite any test files which already exist though)
          Machines.scaffoldTests({
            dir: process.cwd()
          }, {
            error: function (err){
              console.error('Unexpected error occurred:\n', err);
            },
            notMachinepack: function (){
              console.error('This is '+chalk.red('not a machinepack')+'.');
              console.error('Be sure and check that the package.json file has a valid `machinepack` property, or run `machinepack init` if you aren\'t sure.');
            },
            success: function (){

              // (Re)generate a README file using the boilerplate, using fresh description and module name from package.json.
              //  --> (read file at source path, replace substrings with provided data, then write to destination path.)
              Filesystem.template({
                source: path.resolve(__dirname,'../templates/README.template.md'),
                destination: path.resolve(process.cwd(), 'README.md'),
                data: {
                  moduleName: jsonData.name,
                  description: jsonData.description,
                  copyrightYear: (new Date()).getFullYear(),
                  author: jsonData.author,
                  license: jsonData.license||'MIT'
                },
                force: true
              }).exec({
                // An unexpected error occurred.
                error: function(err) {
                  console.error('Unexpected error occurred:\n', err);
                },
                // OK.
                success: function() {
                  console.log();
                  console.log('OK!  I double-checked that each machine in this pack has a test in the tests folder and created one if necessary. I also regenerated the README.md file.');
                  console.log();
                },
              });
            }
          });
        }
      });
    });

  },
});

