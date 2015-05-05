#!/usr/bin/env node

/**
 * Module dependencies
 */

var Path = require('path');
var program = require('commander');
var Machinepacks = require('machinepack-machines');


program
  .usage('[options]')
  .parse(process.argv);


Machinepacks.promptAboutNewMachine().exec({
  error: function (err) {
    console.error('Unexpected error occurred:\n', err);
  },
  success: function (answers){

    var newMachineMetadata = {
      machinepackRootPath: process.cwd(),
      identity: answers.identity,
      friendlyName: answers.friendlyName,
      description: answers.description,
      inputs: {},
      exits: {
        success: {
          variableName: 'result',
          description: 'Done.'
        }
      },
    };

    if (typeof answers.defaultExit !== 'undefined') {
      newMachineMetadata.defaultExit = answers.defaultExit;
    }
    if (typeof answers.idempotent !== 'undefined') {
      newMachineMetadata.idempotent = answers.idempotent;
    }
    if (typeof answers.sync !== 'undefined') {
      newMachineMetadata.sync = answers.sync;
    }
    if (typeof answers.cacheable !== 'undefined') {
      newMachineMetadata.cacheable = answers.cacheable;
    }
    if (typeof answers.moreInfoUrl !== 'undefined') {
      newMachineMetadata.moreInfoUrl = answers.moreInfoUrl;
    }
    if (typeof answers.extendedDescription !== 'undefined') {
      newMachineMetadata.extendedDescription = answers.extendedDescription;
    }

    Machinepacks.addMachine(newMachineMetadata).exec({
      error: function (err) {
        console.error('Error generating new machine:\n', err);
      },
      success: function (){
        // Done!
        console.log('New machine (`%s`) successfully added to machinepack.', answers.identity);
      }
    });
  }
});

