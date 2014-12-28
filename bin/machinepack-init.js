#!/usr/bin/env node

/**
 * Module dependencies
 */

var Path = require('path');
var _ = require('lodash');
var program = require('commander');
var Filesystem = require('machinepack-fs');
var Machinepacks = require('machinepack-machinepacks');


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
