#!/usr/bin/env node

/**
 * Module dependencies
 */

var Path = require('path');
var program = require('commander');
var Machinepacks = require('machinepack-machinepacks');


program
  .usage('[options]')
  .parse(process.argv);


Machinepacks.promptAboutNewMachine().exec({
  error: function (err) {
    console.error('Unexpected error occurred:\n', err);
  },
  success: function (answers){

    Machinepacks.generateNewMachine({
      machinepackRootPath: process.cwd(),
      identity: answers.identity,
      friendlyName: answers.friendlyName,
      description: answers.description,
      extendedDescription: answers.extendedDescription,
      inputs: {},
      defaultExit: 'success',
      exits: {
        error: {
          description: 'Unexpected error occurred.'
        },
        success: {
          description: 'Done.',
          example: 'TODO'
        }
      },
    }).exec({
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

