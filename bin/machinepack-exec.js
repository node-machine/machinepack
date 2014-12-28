#!/usr/bin/env node

/**
 * Module dependencies
 */

var program = require('commander');
var chalk = require('chalk');
var Machinepacks = require('machinepack-machinepacks');
var Machine = require('machine');


program
  .usage('[options] <identity>')
  .parse(process.argv);


if (!program.args[0]) {
  console.error('`identity` required');
  process.exit(1);
}

var identity = program.args[0];


(Machine.build({
  inputs: {
    identity: {
      example: 'do-stuff'
    },
    dir: {
      example: '/Users/mikermcneil/machinepack-foo/'
    }
  },
  defaultExit: 'success',
  exits: {
    success: {
      example: {
        exit: 'success',
        jsonValue: '{"stuff": "things"}',
        void: false
      }
    },
    error: {},
    invalidMachine: {}
  },
  fn: function (inputs, exits, env){

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
              if (!_.contains(jsonData.machinepack.machines, inputs.identity)) {
                return exits.notFound();
              }
              jsonData.machinepack.machines = _.difference(jsonData.machinepack.machines, [inputs.identity]);
            }
            catch (e) {
              return exits.error(e);
            }

            var pathToMachine = Path.resolve(pathToMachines, inputs.identity+'.js');

            env.log();
            // console.log(chalk.red('TODO: .exec() implementation is not finished yet!'));


            // env.log(chalk.gray('(i.e. interactive prompt that asks for input values...'));
            var configuredInputValues = {};

            Machinepacks.runMachine({
              path: pathToMachine,
              inputs: configuredInputValues
            }).exec({
              error: function (err){
                return exits.error(err);
              },
              invalidMachine: function (err){
                return exits.invalidMachine(err);
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
  }
}))({
  identity: identity,
  dir: process.cwd()
})
.setEnvironment({
  log: console.log
})
.exec({
  error: function (err){
    console.error('Unexpected error occurred:\n',err);
  },
  notFound: function (){
    console.error('Cannot run machine `'+chalk.red(identity)+'`.  No machine with that identity exists in this machinepack.');
  },
  invalidMachine: function (err){
    console.error('Cannot run machine `'+chalk.red(identity)+'`. Machine is invalid.  Error details:\n',err);
  },
  success: function (result){
    console.log('* * * DONE * * *');

    console.log('Ran machine: `%s`', identity);
    console.log('with inputs:\n`%s`', 'TODO');
    console.log('Machine called the `%s` exit', chalk.blue(result.exit));
    if (!result.void) {
      console.log('and sent back a return value (encoded as JSON below):\n', result.jsonValue);
    }
    else {
      console.log('No value was returned.');
    }
  }
});


