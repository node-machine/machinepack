#!/usr/bin/env node

/**
 * Module dependencies
 */

var Path = require('path');
var program = require('commander');
var Machinepacks = require('machinepack-localmachinepacks');


program
  .usage('[options]')
  .parse(process.argv);



Machinepacks.initialize({
  dir: process.cwd()
}, {
  error: function (err){
    console.error('Unexpected error occurred:\n', err);
  },
  success: function (machines){
    console.log('Initialized current module as a machinepack');
  }
});
