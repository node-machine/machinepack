#!/usr/bin/env node

/**
 * Module dependencies
 */

var Path = require('path');
var _ = require('lodash');
var program = require('commander');
var chalk = require('chalk');
var Filesystem = require('machinepack-fs');
var Machinepacks = require('machinepack-machinepacks');



program
  .usage('[options] <identity>')
  .parse(process.argv);


if (!program.args[0]) {
  console.error('`identity` required');
  process.exit(1);
}

var identity = program.args[0];


Machinepacks.rm({
  identity: identity,
  dir: Path.resolve(process.cwd())
}).exec({
  error: function (err){
    console.error('Unexpected error occurred:\n',err);
  },
  notFound: function (){
    console.error('Cannot remove machine `' + chalk.red(identity) + '`.  No machine with that identity exists in this machinepack.');
  },
  success: function (){
    console.log('`%s` has been removed from this machinepack.', chalk.blue(identity));
  }
});
