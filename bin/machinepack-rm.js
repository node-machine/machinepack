#!/usr/bin/env node

/**
 * Module dependencies
 */

var program = require('commander');
var chalk = require('chalk');
var Machinepacks = require('machinepack-machinepacks');



program
  .usage('[options] <identity>')
  .parse(process.argv);

var identity = program.args[0];
if (!identity) {
  console.error('`identity` required');
  process.exit(1);
}



Machinepacks.removeMachine({
  identity: identity,
  dir: process.cwd()
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
