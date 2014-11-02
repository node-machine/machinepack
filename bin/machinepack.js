#!/usr/bin/env node


/**
 * Module dependencies
 */

var Path = require('path');
var _ = require('lodash');
var MachinepackUtils = require('../');


// Arguments
var INPUTS = {

  // `dir` is the path to the machinepack of interest
  // (defaults to process.cwd())
  dir: Path.resolve(process.cwd())

};


MachinepackUtils.dehydrateMachines({
  dir: INPUTS.dir
}).exec({
  success: function (machines){
    console.log();
    console.log('Machines in "%s":\n',
      INPUTS.dir,
      (_.map(machines, function (machine){
        return ''+
        ' • ' + (machine.friendlyName || machine.identity) +
                (machine.description ? '      (' + machine.description + ')' : '');
      })).join('\n')
    );
    console.log();
  },
  error: function (err){
    console.error('Error listing contents of "%s":', INPUTS.dir);
    console.error(err);
    return;
  }
});



/*
// for later:
var inquirer = require("inquirer");
inquirer.prompt([
  //Pass your questions in here
], function( answers ) {
    // Use user feedback for... whatever!!
});
*/
