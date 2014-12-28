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


if (!program.args[0]) {
  console.error('`identity` required');
  process.exit(1);
}

var identity = program.args[0];


(function (inputs, exits, env){

  // Dependencies
  var Path = require('path');
  var _ = require('lodash');
  var Filesystem = require('machinepack-fs');
  var Machinepacks = require('machinepack-machinepacks');

  Machinepacks.getMachinesDir({
    dir: Path.resolve(process.cwd(), inputs.dir)
  }).exec({
    error: function (err){
      return exits.error(err);
    },
    success: function (pathToMachines){

      Filesystem.readJson({
        source: Path.resolve(process.cwd(), 'package.json')
      }).exec({
        error: function (err){
          return exits.error(err);
        },
        success: function (jsonData){
          try {
            if (!_.contains(jsonData.machinepack.machines, identity)) {

              return;
            }
            jsonData.machinepack.machines = _.difference(jsonData.machinepack.machines, [identity]);
          }
          catch (e) {
            return exits.error(e);
          }

          var pathToMachine = Path.resolve(pathToMachines, identity+'.js');

          env.log();
          // console.log(chalk.red('TODO: .exec() implementation is not finished yet!'));


          // env.log(chalk.gray('(i.e. interactive prompt that asks for input values...'));
          var configuredInputValues = {};

          env.log(chalk.gray('Running machine at', pathToMachine));
          Machinepacks.runMachine({
            path: pathToMachine,
            inputs: configuredInputValues
          }).exec({
            error: function (err){
              return exits.error(err);
            },
            success: function (result){
              // env.log(chalk.gray('  then a log explaining which exit was traversed and the return value, if relevant)'));
              return exits.success(result);
            }
          });

        },
      });
    }
  });


})({
  dir: process.cwd()
}, {
  error: function (err){
    console.error('Unexpected error occurred:\n',err);
  },
  notFound: function (){
    console.error('Cannot run machine `'+chalk.red(identity)+'`.  No machine with that identity exists in this machinepack.');
  },
  success: function (result){
    console.log('* * * DONE * * *');
  }
}, {
  log: console.log
});
