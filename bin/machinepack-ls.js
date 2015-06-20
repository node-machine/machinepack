#!/usr/bin/env node

/**
 * Module dependencies
 */

var Path = require('path');
var _ = require('lodash');
var chalk = require('chalk');
var Machinepacks = require('machinepack-localmachinepacks');
var program = require('commander');

program
.usage('[options]')
.parse(process.argv);


Machinepacks.listMachines({
  dir: process.cwd()
}, {
  error: function (err){
    console.error('Unexpected error occurred:\n', err);
  },
  notMachinepack: function (){
    console.error('This is '+chalk.red('not a machinepack')+'.');
    console.error('Be sure and check that the package.json file has a valid `machinepack` property, or run `machinepack init` if you aren\'t sure.');
  },
  success: function (machines){
    console.log();
    if (machines.length === 0){
      console.log('There are '+chalk.blue('no machines')+' in this machinepack.');
    }
    else if (machines.length === 1) {
      console.log('There is only '+chalk.blue('1')+' machine in this machinepack.');
    }
    else {
      console.log('There are '+chalk.blue('%d')+' machines in this machinepack:',machines.length);
    }
    console.log(chalk.gray('============================================='));
    _.each(machines, function (machineIdentity){
      console.log(' • '+machineIdentity);
    });
    console.log();
  }
});
