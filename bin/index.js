/**
 * Module dependencies
 */

var Path = require('path');
var NodeMachine = require('node-machine');
var Filesystem = require('machinepack-fs');

/*
// for later:
var inquirer = require("inquirer");
inquirer.prompt([
  //Pass your questions in here
], function( answers ) {
    // Use user feedback for... whatever!!
});
*/


var cwd = Path.resolve(process.cwd());

Filesystem.ls(cwd, function(err, paths) {
  if (err) {
    console.error('Error listing contents of "%s":', cwd);
    console.error(err);
    return;
  }

  var machinepack = NodeMachine.pack({
    pkg: {
      machinepack: {
        machines: _.map(_.where(paths, function(path) {
          return path.match(/\.js$/);
        }), function(path) {
          return Path.basename(path, '.js');
        })
      }
    },
    dir: cwd
  });


  var stringified = JSON.stringify(machinepack);
  console.log('Success!');
  console.log(stringified);
});
