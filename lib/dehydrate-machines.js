
/**
 * Module dependencies
 */

var util = require('util');
var Path = require('path');
var _ = require('lodash');
var NodeMachine = require('node-machine');
var Filesystem = require('machinepack-fs');

module.exports = {

  description: 'Get metadata from the machine definition files located in the directory at the specified path.',

  inputs: {
    dir: {
      example: '/Users/mikermcneil/foo/bar/',
      description: 'The path to the folder where the target machine files are located'
    }
  },

  exits: {
    success: {
      example: [{
        identity: 'do-something',
        variableName: 'doSomething',
        inputs: {},
        exits: {}
      }]
    }
  },


  fn: function (INPUTS, EXITS) {

    Filesystem.ls({
      dir: INPUTS.dir
    }, function(err, machinePaths) {

      if (err) {
        return EXITS.error((function (){
          var e = new Error();
          e.code = 'E_FILESYSTEM';
          e.dir = INPUTS.dir;
          e.message = util.format('Error listing contents of "%s":', INPUTS.dir);
          e.originalError = err;
          return e;
        })());
      }

      // Load the machines into memory
      var machinepack = NodeMachine.pack({
        pkg: {
          machinepack: {
            machines: _.map(_.where(machinePaths, function excludeNonJavascriptFiles(machinePath) {
              return machinePath.match(/\.js$/) && !machinePath.match(/\/index\.js$/);
            }), function pluckBasename(machinePath) {
              return Path.basename(machinePath, '.js');
            })
          }
        },
        dir: INPUTS.dir
      });

      // Now extract metadata for each machine
      // (namely the input and exit schemas)
      var dehydratedMachines = _.reduce(machinepack, function (memo, machine){

        // TODO: adapt node machine so we can just call `machine.toJSON()` here.

        memo.push({
          identity: machine.identity,
          variableName: machine.variableName,
          description: machine.description,
          technicalNotes: machine.technicalNotes,
          noSideEffects: machine.noSideEffects,
          inputs: machine.inputs,
          exits: machine.exits
        });

        return memo;

      }, []);

      return EXITS.success(dehydratedMachines);
    });
  }
};
