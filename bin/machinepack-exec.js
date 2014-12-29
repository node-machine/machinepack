#!/usr/bin/env node

/**
 * Module dependencies
 */

var program = require('commander');
var chalk = require('chalk');
var Machinepacks = require('machinepack-machines');
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
          inspectedValue: '{stuff: "things"}',
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
    var Machinepacks = require('machinepack-machines');

    var machinepackPath = Path.resolve(process.cwd(), inputs.dir);

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

        // Calculate appropriate variable name for machinepack
        var machinepackVarName = (function (moduleName){
          var varname = moduleName.replace(/^machinepack-/,'');
          varname = varname.replace(/-[a-z]/ig,function (match){
            return match.slice(1).toUpperCase();
          });
          varname = varname[0].toUpperCase() + varname.slice(1);
          return varname;
        })(jsonData.name);

        // Calculate appropriate machine method name
        // TODO: use machinepack-javascript to do this
        var machineMethodName = (function(identity){
          return identity.replace(/-[a-z]/ig, function (match) {
            return match.slice(1).toUpperCase();
          });
        })(identity);

        console.log();
        console.log(chalk.gray('%s.%s()'), chalk.bold(chalk.white(machinepackVarName)), chalk.bold(chalk.yellow(machineMethodName)));

        Machinepacks.getMachinesDir({
          dir: Path.resolve(process.cwd(), inputs.dir)
        }).exec({
          error: function (err){
            return exits.error(err);
          },
          success: function (pathToMachines){

            var pathToMachine = Path.resolve(pathToMachines, inputs.identity+'.js');

            env.log();

            Machinepacks.runMachineInteractive({
              machinepackPath: machinepackPath,
              identity: inputs.identity
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

    // console.log('');
    // console.log(chalk.white(' * * * * * * * * * * * * * * * * * * * * * * * * '));
    // console.log(chalk.white(' *                  OUTCOME                    * '));
    // console.log(chalk.white(' * * * * * * * * * * * * * * * * * * * * * * * * '));
    console.log('');
    // console.log(' using input values:\n', chalk.bold(chalk.yellow(identity)), _.reduce(result.withInputs, function(memo, configuredInput) {

    // console.log(' Used input values:\n', _.reduce(result.withInputs, function(memo, configuredInput) {
    //   memo += '\n • ' + configuredInput.name + ' : ' + chalk.gray(JSON.stringify(configuredInput.value));
    //   return memo;
    // }, ''));
    // console.log('');
    // console.log(' Triggered '+chalk.blue(result.exited.exit)+' callback'+(function (){
    //   if (!result.exited.void) {
    //     return ', returning:\n ' + chalk.gray(result.exited.jsonValue);
    //   }
    //   return '.';
    // })());

    console.log(' The machine triggered its '+chalk.bold((function (){
      if (result.exited.exit === 'error') {
        return chalk.red(result.exited.exit);
      }
      return chalk.blue(result.exited.exit);
    })())+' exit'+(function (){
      if (!result.exited.void) {
        return ' and returned a value:\n '+chalk.gray(result.exited.inspectedValue);
      }
      return '.';
    })());
    console.log();
    console.log();
    console.log(chalk.white(' To run again:'));
    console.log(chalk.white((function (){
      var cmd = ' machinepack exec '+identity;
      _.each(result.withInputs, function (configuredInput){
        cmd += ' ';
        cmd += '--'+configuredInput.name+'='+configuredInput.value;
      });
      return cmd;
    })()));
    console.log();
  }
});


