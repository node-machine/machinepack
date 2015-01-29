#!/usr/bin/env node

/**
 * Module dependencies
 */

var program = require('commander');
var chalk = require('chalk');
var Machines = require('machinepack-machines');


program
  .usage('')
  .parse(process.argv);



require('machine').build({
  sync: true,
  inputs: {
    dir: {
      example: '/Users/mikermcneil/machinepack-foo/'
    }
  },
  defaultExit: 'success',
  exits: {
    success: {
      example: 'http://node-machine.org/machinepack-foobar'
    },
    error: {},
    notMachinepack: {}
  },
  fn: function (inputs, exits){
    Machines.readPackageJson({
      dir: process.cwd()
    }).exec({
      error: exits.error,
      notMachinepack: exits.notMachinepack,
      success: function (machinepack){
        require('open')(machinepack.nodeMachineUrl);
        return exits.success(machinepack.nodeMachineUrl);
      }
    });
  }
})({
  dir: process.cwd()
}).exec({
  error: function(err) {
    console.error(chalk.red('Unexpected error occurred:\n'), err);
  },
  notMachinepack: function() {
    console.error('This is ' + chalk.red('not a machinepack') + '.');
    console.error('Be sure and check that the package.json file has a valid `machinepack` property, or run `machinepack init` if you aren\'t sure.');
  },
  success: function(url) {
    console.log('Opening %s...',chalk.underline(url));
  }
});
