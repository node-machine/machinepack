#!/usr/bin/env node

/**
 * Module dependencies
 */

var program = require('commander');
var chalk = require('chalk');
var Machine = require('machine');
var _ = require('lodash');
var yargs = require('yargs');

// Build CLI options
var cliOpts = yargs.argv;
delete cliOpts._;
delete cliOpts.$0;

program
  .usage('[options] <identity>')
  .parse(process.argv);


// if (!program.args[0]) {
//   console.error('`identity` required');
//   process.exit(1);
// }


var identity = program.args[0];



// exposed via closure simply for convenience
var machinepackVarName;
var machineMethodName;


Machine.build({
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
    noMachines: {},
    invalidMachine: {}
  },
  fn: function (inputs, exits){

    // Dependencies
    var Path = require('path');
    var _ = require('lodash');
    var inquirer = require('inquirer');
    var Filesystem = require('machinepack-fs');
    var Machinepacks = require('machinepack-machines');

    var machinepackPath = Path.resolve(process.cwd(), inputs.dir);

    Machinepacks.readPackageJson({dir: inputs.dir}).exec({
      error: exits,
      success: function (machinepack){

        // If no identity was provided, choose the machine to run from a list, interactively.
        (function (next){
          if (identity) {
            return next(null, identity);
          }

          if (machinepack.machines.length < 1) {
            return next((function (){
              var err = new Error('There are no machines in this machinepack.');
              err.exit = err.code = 'noMachines';
              return err;
            })());
          }

          inquirer.prompt([{
            name: 'machine',
            message: 'Please choose a machine to run.',
            type: 'list',
            // when: function (){
            //   return !machine;
            // },
            choices: _.sortBy(_.reduce(machinepack.machines, function (memo, machine){
              memo.push({
                name: machine,
                value: machine
              });
              return memo;
            }, []), 'name')
          }], function (answers){
            next(null, answers.machine);
          });

        })(function (err, _identity){
          if (err) return exits(err);

          // Expose _identity on closure scope for convenience. (this is a hack)
          identity = _identity;

          // Calculate appropriate variable name for machinepack and expose in closure scope (quick hack)
          machinepackVarName = machinepack.variableName;
          // Calculate appropriate machine method name and expose in closure scope (quick hack)
          // TODO: use machinepack-javascript to do this
          machineMethodName = (function(identity){
            return identity.replace(/-[a-z]/ig, function (match) {
              return match.slice(1).toUpperCase();
            });
          })(identity);

          console.log('\n'+chalk.gray(' Running machine...'));
          console.log();

          Machinepacks.runMachineInteractive({
            machinepackPath: machinepackPath,
            identity: identity,
            inputValues: (function (){
              return _.reduce(cliOpts, function (memo, inputValue, inputName){
                memo.push({
                  name: inputName,
                  value: inputValue,
                  protect: false
                });
                return memo;
              }, []);
            })()
          }).exec({
            error: exits.error,
            invalidMachine: exits.invalidMachine,
            success: function (result){
              return exits.success(result);
            }
          });
        });
      }
    });

  }
}).configure({
  identity: identity,
  dir: process.cwd()
}).exec({
  error: function (err){
    console.error('Unexpected error occurred:\n',typeof err === 'object' && err instanceof Error ? err.stack : err);
  },
  notFound: function (){
    console.error('Cannot run machine `'+chalk.red(identity)+'`.  No machine with that identity exists in this machinepack.');
  },
  invalidMachine: function (err){
    console.error('Cannot run machine `'+chalk.red(identity)+'`. Machine is invalid.  Error details:\n',err);
  },
  noMachines: function (err){
    console.error(chalk.gray('There are no machines in this machinepack...\n(you should make some!)'));
  },
  success: function (result){

    console.log('___'+repeatChar('_')+'_˛');
    console.log('   '+repeatChar(' ')+'  ');
    console.log('   '+chalk.gray('%s.%s()'), chalk.bold(chalk.white(machinepackVarName)), chalk.bold(chalk.yellow(machineMethodName)));

    // console.log('');
    // console.log(chalk.white(' * * * * * * * * * * * * * * * * * * * * * * * * '));
    // console.log(chalk.white(' *                  OUTCOME                    * '));
    // console.log(chalk.white(' * * * * * * * * * * * * * * * * * * * * * * * * '));
    // console.log('');
    // console.log(' using input values:\n', chalk.bold(chalk.yellow(identity)), _.reduce(result.withInputs, function(memo, configuredInput) {

    // console.log(' Used input values:\n', _.reduce(result.withInputs, function(memo, configuredInput) {
    console.log('  ');
    console.log(_.reduce(result.withInputs, function(memo, configuredInput) {
      memo += '   » ' + chalk.white(configuredInput.name) + ' ' + chalk.gray(JSON.stringify(configuredInput.value));
      memo += '\n';
      return memo;
    }, ''));
    console.log('___'+repeatChar('_')+'_¸ ');
    console.log('  | ');

    // console.log(' Triggered '+chalk.blue(result.exited.exit)+' callback'+(function (){
    //   if (!result.exited.void) {
    //     return ', returning:\n ' + chalk.gray(result.exited.jsonValue);
    //   }
    //   return '.';
    // })());

    // Determine chalk color
    var exitColor = (function (){
      if (result.exited.exit === 'error') {
        return 'red';
      }
      if (result.exited.exit === 'success') {
        return 'green';
      }
      return 'blue';
    })();

    console.log('  '+chalk.bold(chalk[exitColor]('•'))+' \n  The machine triggered its '+chalk.bold(chalk[exitColor](result.exited.exit))+' exit'+(function (){
      if (!result.exited.void) {
        return ' and returned a value:\n   '+chalk.gray(result.exited.inspectedValue);
      }
      return '.';
    })());
    console.log();
    console.log();
    console.log(chalk.white(' To run again:'));
    console.log(chalk.white((function (){
      var cmd = ' machinepack exec '+identity;
      _.each(result.withInputs, function (configuredInput){

        // Skip protected inputs (they need to be re-entered)
        if (configuredInput.protect) return;

        cmd += ' ';
        cmd += '--'+configuredInput.name+'=\''+configuredInput.value.replace(/'/g,'\'\\\'\'')+'\'';
      });
      return cmd;
    })()));
    console.log();
  }
});



/**
 * private helper fn
 * @param  {[type]} char  [description]
 * @param  {[type]} width [description]
 * @return {[type]}       [description]
 */
function repeatChar(char,width){
  width = width || 60;
  var borderStr = '';
  for (var i=0;i<width;i++) {
    borderStr += char;
  }
  return borderStr;
}



