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

Machinepacks.getMachinesDir({
  dir: Path.resolve(process.cwd())
}).exec({
  error: function (err){
    console.error('Unexpected error occurred:\n',err);
  },
  success: function (pathToMachines){

    Filesystem.readJson({
      source: Path.resolve(process.cwd(), 'package.json')
    }).exec({
      error: function (err){
        console.error('Unexpected error occurred:\n',err);
      },
      success: function (jsonData){
        try {
          if (!_.contains(jsonData.machinepack.machines, identity)) {
            console.error('Cannot run machine `'+chalk.red(identity)+'`.  No machine with that identity exists in this machinepack.');
            return;
          }
          jsonData.machinepack.machines = _.difference(jsonData.machinepack.machines, [identity]);
        }
        catch (e) {
          console.error('Unexpected error occurred:\n',err);
          return;
        }

        console.log();
        console.log(chalk.red('TODO: .exec() implementation is not finished yet!'));
        console.log(chalk.gray('(i.e. interactive prompt that asks for input values...'));
        console.log(chalk.gray('  then a log explaining which exit was traversed and the return value, if relevant)'));


      },
    });
  }
});

