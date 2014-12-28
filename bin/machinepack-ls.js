#!/usr/bin/env node

/**
 * Module dependencies
 */

var Path = require('path');
var _ = require('lodash');
var chalk = require('chalk');
var Filesystem = require('machinepack-fs');
var Machinepacks = require('machinepack-machinepacks');
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
