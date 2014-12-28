#!/usr/bin/env node


/**
 * Module dependencies
 */

var Path = require('path');
var Machinepacks = require('machinepack-machinepacks');


Machinepacks.promptAboutNewMachine().exec({
  error: function (err) {
    console.error('Unexpected error occurred:\n', err);
  },
  success: function (answers){

    // TODO: consider another machine to validate/sanitize this stuff
    // (even so, it would probably be taken care of within `promptAboutNewMachine()`)
    var machineMetadata = answers;

    Machinepacks.generateNewMachine({
      machinepackRootPath: process.cwd(),
      identity: machineMetadata.identity,
      friendlyName: machineMetadata.friendlyName,
      description: machineMetadata.description,
      extendedDescription: machineMetadata.extendedDescription,
      inputs: {},
      defaultExit: 'success',
      exits: {
        error: {
          description: 'Unexpected error.'
        },
        success: {
          description: 'Done.',
          example: '...'
        }
      },
    }).exec({
      error: function (err) {
        console.error('Error generating new machine:\n', err);
      },
      success: function (){
        // Done!
      }
    });
  }
});

