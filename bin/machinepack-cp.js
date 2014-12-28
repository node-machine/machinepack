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
  .usage('[options] <originalIdentity> <newIdentity>')
  .parse(process.argv);


var originalIdentity = program.args[0];
if (!program.args[0]) {
  console.error('`originalIdentity` required');
  process.exit(1);
}

var newIdentity = program.args[1];
if (!program.args[1]) {
  console.error('`newIdentity` required');
  process.exit(1);
}



Machinepacks.copyMachine({
  originalIdentity: originalIdentity,
  newIdentity: newIdentity,
  dir: process.cwd()
}).exec({
  error: function (err){
    console.error('Unexpected error occurred:\n',err);
  },
  success: function (){
    console.log('Copied: `%s` to new machine: `%s`', originalIdentity, newIdentity);
  }
});
