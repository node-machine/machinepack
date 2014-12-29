#!/usr/bin/env node

/**
 * Module dependencies
 */

var Path = require('path');
var program = require('commander');
var Machinepacks = require('machinepack-machines');


program
  .usage('[options] <originalIdentity> <newIdentity>')
  .parse(process.argv);


var originalIdentity = program.args[0];
if (!originalIdentity) {
  console.error('`originalIdentity` required');
  process.exit(1);
}

var newIdentity = program.args[1];
if (!newIdentity) {
  console.error('`newIdentity` required');
  process.exit(1);
}


Machinepacks.renameMachine({
  originalIdentity: originalIdentity,
  newIdentity: newIdentity,
  dir: process.cwd()
}).exec({
  error: function (err){
    console.error('Unexpected error occurred:\n',err);
  },
  success: function (){
    console.log('Machine with former identity: `%s` is now: `%s`', originalIdentity, newIdentity);
  }
});
