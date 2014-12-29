#!/usr/bin/env node

/**
 * Module dependencies
 */

var program = require('commander');
var chalk = require('chalk');
var Machinepacks = require('machinepack-machinepacks');
var Machine = require('machine');
var _ = require('lodash');

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
        withInputs: [
          {
            name: 'foobar',
            value: 'fiddle diddle'
            // ^^^^^ this is ok because it's always a string entered on the CLI interactive prompt
          }
        ],
        exited: {
          exit: 'success',
          jsonValue: '{"stuff": "things"}',
          void: false
        }
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

            Machinepacks.runMachine({
              path: pathToMachine
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

    console.log('');
    console.log(chalk.white(' * * * * * * * * * * * * * * * * * * * * * * * * '));
    console.log(chalk.white(' *                  OUTCOME                    * '));
    console.log(chalk.white(' * * * * * * * * * * * * * * * * * * * * * * * * '));
    console.log('');
    console.log(' Ran %s machine using the following input values:\n', chalk.bold(chalk.yellow(identity)), _.reduce(result.withInputs, function(memo, configuredInput) {
      memo += '\n • ' + configuredInput.name + ' : ' + chalk.gray(JSON.stringify(configuredInput.value));
      return memo;
    }, ''));
    console.log('');
    console.log(' Machine exited with `'+chalk.blue(result.exited.exit)+'`'+(function (){
      if (!result.exited.void) {
        return ', returning:\n ' + chalk.gray(result.exited.jsonValue);
      }
      return '.';
    })());
    console.log();
    // console.log(chalk.purple('(^ result value above is encoded as JSON for readability)'));
  }
});


