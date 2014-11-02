#!/usr/bin/env node


/**
 * Module dependencies
 */

var MachinepackUtils = require('../');


// Arguments
var inputs = {

  // `dir` is the path to the machinepack of interest
  // (defaults to process.cwd())
  dir: Path.resolve(process.cwd())

};


MachinepackUtils.dehydrateMachinepack({
  dir: dir
}).exec({
  success: function (){
    console.log('Success!');
  },
  error: function (err){
    console.error('Error listing contents of "%s":', dir);
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
