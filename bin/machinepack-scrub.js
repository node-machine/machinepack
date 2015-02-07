#!/usr/bin/env node

/**
 * Module dependencies
 */

var _ = require('lodash');
var chalk = require('chalk');
var Machines = require('machinepack-machines');
var Filesystem = require('machinepack-fs');
var program = require('commander');

program
.usage('[options]')
.parse(process.argv);

// TODO: if a machine file exists, but is not in the package.json, prompt about it

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
      jsonData.devDependencies['test-machinepack-mocha'] = '^0.2.2';
      jsonData.scripts = jsonData.scripts||{};
      jsonData.scripts.test = 'node ./node_modules/test-machinepack-mocha/bin/testmachinepack-mocha.js';
    }
    catch (e) {
      console.error('Unexpected error parsing or modifying package.json data:\n', e);
      return;
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
            console.log();
            console.log('Done!  (I double-checked that each machine in this pack has a test in the tests folder and created one if necessary.)');
            console.log();
          }
        });
      }
    });
  },
});
