#!/usr/bin/env node

/**
 * Module dependencies
 */

var _ = require('lodash');
var chalk = require('chalk');
var Machines = require('machinepack-machines');
var program = require('commander');

program
.usage('[options]')
.parse(process.argv);

// TODO: if a machine file exists, but is not in the package.json, prompt about it

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
