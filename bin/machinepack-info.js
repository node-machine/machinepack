#!/usr/bin/env node

/**
 * Module dependencies
 */

var util = require('util');
var program = require('commander');
var _ = require('lodash');
var chalk = require('chalk');
var Javascript = require('machinepack-javascript');
var Machines = require('machinepack-machines');



program
  .usage('[options]')
  .parse(process.argv);



Machines.readPackageJson({
  dir: process.cwd()
}).exec({
  error: function(err) {
    console.error('Unexpected error occurred:\n', err);
  },
  notMachinepack: function() {
    console.error('This is ' + chalk.red('not a machinepack') + '.');
    console.error('Be sure and check that the package.json file has a valid `machinepack` property, or run `machinepack init` if you aren\'t sure.');
  },
  success: function(machinepack) {
    // console.log();
    //console.log(chalk.bold(machinepack.friendlyName)/*+'   '+chalk.gray('('+machinepack.identity+')')*/);
    //console.log(chalk.white(machinepack.description));

    console.log();
    console.log();

    console.log('' + chalk.bold(machinepack.friendlyName) + ' -- ' + chalk.reset(machinepack.description));
    // console.log(chalk.gray('('+machinepack.identity+')'));
    console.log();
    console.log();

    var urls = (function(_urls) {
      if (machinepack.nodeMachineUrl) {
        _urls.push(machinepack.nodeMachineUrl);
      }
      if (machinepack.npmUrl) {
        _urls.push(machinepack.npmUrl);
      }
      if (machinepack.githubUrl) {
        _urls.push(machinepack.githubUrl);
      }
      return _urls;
    })([]);
    if (urls.length > 0) {
      console.log(chalk.bold('URLS'));
      _.each(urls, function(url) {
        console.log('     ' + chalk.underline(url));
      });
      console.log();
      console.log();
    }

    console.log(chalk.bold('INSTALLATION'));
    // console.log();
    console.log(chalk.white('     npm install ' + chalk.bold(machinepack.npmPackageName) + '@^' + machinepack.version + ' --save'));
    console.log();
    console.log();

    console.log(chalk.bold('USAGE'));
    // console.log();
    console.log('     var ' + machinepack.variableName + ' = require(\'' + machinepack.npmPackageName + '\');');
    console.log();
    console.log();

    console.log(chalk.bold('AVAILABLE METHODS'));
    // console.log();

    if (machinepack.machines.length < 1) {
      console.log(chalk.gray('     none'));
    } else {
      // console.log('%s %s:', chalk.bold(chalk.blue(machinepack.machines.length)), machinepack.machines.length===1?'Machine':'Machines');
      _.each(machinepack.machines, function(machineIdentity) {
        // Calculate appropriate machine method name
        var methodName = Javascript.convertToEcmascriptCompatibleVarname({
          string: machineIdentity,
          force: true
        }).execSync();
        console.log('     %s.%s()   %s', chalk.white(machinepack.variableName), chalk.yellow(methodName), chalk.gray('(' + machineIdentity + ')'));
      });
    }
    // console.log();
    // console.log('     '+chalk.gray('Run ')+chalk.bold.gray('machinepack show <machine>')+chalk.gray(' for details'));
    // console.log(chalk.gray('     to take a closer look:  ')+chalk.bold.gray('machinepack show <machine>'));
    console.log();
    console.log();
    // console.log(chalk.gray.bold('NPM')+'\n' + chalk.gray(machinepack.npmPackageName + '\n' + 'v'+machinepack.version));
  }
});
