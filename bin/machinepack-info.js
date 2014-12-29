#!/usr/bin/env node

/**
 * Module dependencies
 */

var util = require('util');
var program = require('commander');
var _ = require('lodash');
var chalk = require('chalk');
var Machine = require('machine');
var convertToEcmascriptCompatibleVarname = require('convert-to-ecmascript-compatible-varname');
    // TODO: use machinepack-javascript to do this



program
  .usage('[options]')
  .parse(process.argv);



(Machine.build({
  inputs: {
    dir: {
      example: '/Users/mikermcneil/machinepack-foo/'
    }
  },
  defaultExit: 'success',
  exits: {
    error: {
      description: 'Unexpected error occurred'
    },
    notMachinepack: {
      description: 'The specified path is not the root directory of a machinepack'
    },
    success: {
      example: {
        npmModuleName: 'machinepack-fs',
        variableName: 'Filesystem',
        friendlyName: 'Filesystem Utilities',
        identity: 'machinepack-fs',
        version: '1.6.0',
        description: 'Work with the local filesystem; list files, write files, etc.',
        keywords: ['keywords'],
        machines: ['do-something'],
        machineDir: 'machines/'
      }
    }
  },
  fn: function (inputs, exits){

    // Dependencies
    var Path = require('path');
    var Filesystem = require('machinepack-fs');
    var Machinepacks = require('machinepack-machines');
    var convertToEcmascriptCompatibleVarname = require('convert-to-ecmascript-compatible-varname');
    // TODO: use machinepack-javascript to do this


    var machinepackPath = Path.resolve(process.cwd(), inputs.dir);
    var packageJsonPath = Path.resolve(machinepackPath, 'package.json');

    Filesystem.readJson({
      source: packageJsonPath
    }).exec({
      error: function (err){
        return exits.error(err);
      },
      doesNotExist: function (){
        return exits.notMachinepack();
      },
      success: function (jsonData){

        // Not a machinepack
        if (!jsonData.machinepack) {
          return exits.notMachinepack();
        }

        var machinepackMetadata;
        try {
          machinepackMetadata = {
            identity: jsonData.name,
            npmModuleName: jsonData.name,
            friendlyName: jsonData.machinepack.friendlyName,
            version: jsonData.version,
            description: jsonData.description,
            keywords: jsonData.keywords,
            machines: jsonData.machinepack.machines,
            machineDir: jsonData.machinepack.machineDir
          };

          // If a friendlyName is not explicitly specified, build one from `identity`
          machinepackMetadata.friendlyName = (function determineSuitableFriendlyName (){
            var friendlyName = (jsonData.machinepack&&jsonData.machinepack.friendlyName) || machinepackMetadata.identity;
            // If friendlyname still has "machinepack-" prefix in it, wipe it out
            friendlyName = friendlyName.replace(/^machinepack-/, '');

            // Then capitalize whatever's left
            return friendlyName[0].toUpperCase() + friendlyName.slice(1);
          })();

          // Build `variableName` from friendlyName, but first...
          machinepackMetadata.variableName = (function determineSuitableVariableName (){
            var variableName = machinepackMetadata.friendlyName;
            // convert to a ecmascript-compatible variable
            variableName = convertToEcmascriptCompatibleVarname(variableName);
            // then capitalize the first letter)
            return variableName[0].toUpperCase() + variableName.slice(1);
          })();
        }
        catch (e) {
          return exits.error(e);
        }

        return exits.success(machinepackMetadata);
      }
    });
  }
}))({
  dir: process.cwd()
}, {
  error: function (err){
    console.error('Unexpected error occurred:\n',err);
  },
  notMachinepack: function (){
    console.error('This is '+chalk.red('not a machinepack')+'.');
    console.error('Be sure and check that the package.json file has a valid `machinepack` property, or run `machinepack init` if you aren\'t sure.');
  },
  success: function (machinepack){
    // console.log();
    //console.log(chalk.bold(machinepack.friendlyName)/*+'   '+chalk.gray('('+machinepack.identity+')')*/);
    //console.log(chalk.white(machinepack.description));

    console.log();
    console.log();

    console.log(''+chalk.bold(machinepack.friendlyName)+' -- '+chalk.reset(machinepack.description));
    // console.log(chalk.gray('('+machinepack.identity+')'));
    console.log();
    console.log();

    console.log(chalk.bold('INSTALLATION'));
    // console.log();
    console.log(chalk.white('     npm install '+chalk.bold(machinepack.npmModuleName) + '@^'+machinepack.version + ' --save'));
    console.log();
    console.log();

    console.log(chalk.bold('USAGE'));
    // console.log();
    console.log('     var '+machinepack.variableName+' = require(\''+machinepack.npmModuleName + '\');');
    console.log();
    console.log();

    console.log(chalk.bold('AVAILABLE METHODS'));
    // console.log();

    if (machinepack.machines.length < 1) {
      console.log('\n'+chalk.gray('     none'));
    }
    else {
      // console.log('%s %s:', chalk.bold(chalk.blue(machinepack.machines.length)), machinepack.machines.length===1?'Machine':'Machines');
      _.each(machinepack.machines,function (machineIdentity){
        // Calculate appropriate machine method name
        var methodName = convertToEcmascriptCompatibleVarname(machineIdentity);
        console.log('     %s.%s()   %s',chalk.white(machinepack.variableName), chalk.yellow(methodName), chalk.gray('('+machineIdentity+')'));
      });
    }
    // console.log();
    // console.log('     '+chalk.gray('Run ')+chalk.bold.gray('machinepack show <machine>')+chalk.gray(' for details'));
    // console.log(chalk.gray('     to take a closer look:  ')+chalk.bold.gray('machinepack show <machine>'));
    console.log();
    console.log();
    // console.log(chalk.gray.bold('NPM')+'\n' + chalk.gray(machinepack.npmModuleName + '\n' + 'v'+machinepack.version));
  }
});
