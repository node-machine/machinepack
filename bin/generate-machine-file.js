#!/usr/bin/env node


/**
 * Module dependencies
 */

var Path = require('path');
var _ = require('lodash');
var Filesystem = require('machinepack-fs');


// TODO: `Machinepacks.promptAboutNewMachine()`
// then...
Machinepacks.generateMachineFile({

  // `machinepackRootPath` is the path to the machinepack of interest
  // (defaults to process.cwd())
  machinepackRootPath: Path.resolve(process.cwd()),

  // `identity` of the new machine to be generated
  identity: 'TODO',

  friendlyName: 'TODO',

  description: 'TODO',

  extendedDescription: 'TODO',

  inputs: { /* todo (typeclass dictionary) */ },

  exits: { /* todo (typeclass dictionary) */ },

  defaultExit: 'TODO'
}).exec({
  error: function (err) {
    console.error('Error generating new machine:\n', err);
  },
  success: function (){
    // Done!
  }
});






// TODO: actually implement this
// Faking it:
function Machinepacks (){}
Machinepacks.generateMachineFile = function generateMachineFile(inputs, done){

  // Determine the appropriate location for the new machine
  Machinepacks.getMachinesDir({
    dir: inputs.machinepackRootPath
  }).exec({
    error: function (err) {
      return done(err);
    },
    success: function (machinesDirpath){

      var outputPath = Path.resolve(machinesDirpath, inputs.identity+'.js');

      // Build the code string that will be written to disk
      Machinepacks.buildMachine({
        identity: inputs.identity,
        friendlyName: inputs.friendlyName,
        description: inputs.description,
        extendedDescription: inputs.extendedDescription,
        inputs: inputs.inputs,
        exits: inputs.exits,
        defaultExit: inputs.defaultExit
      }).exec({
        error: function (err){
          return done(err);
        },
        success: function (codeStr){

          // Generate a file on the local filesystem using the specified utf8 string as its contents.
          Filesystem.write({
            string: codeStr,
            destination: outputPath,
            force: false
          }).exec({

            error: function (err){
              return done(err);
            },

            // Something already exists at the specified path (overwrite by enabling the `force` input)
            alreadyExists: function (){
              return done(new Error('Something already exists at '+outputPath));
            },

            success: function (){

              // Determine path to package.json file.
              var packageJsonPath = Path.resolve(inputs.machinepackRootPath, 'package.json');

              // Read contents of package.json file
              Filesystem.read({
                source: packageJsonPath
              }).exec({
                error: function (err){
                  return done(err);
                },
                success: function (packageJsonString){

                  // Modify package.json, adding the new machine we're generating.
                  try {
                    var jsonData = JSON.parse(packageJsonString);
                    jsonData.machinepack.machines = _.union(jsonData.machinepack.machines, [inputs.identity]);
                    packageJsonString = JSON.stringify(jsonData);

                    // Rewrite contents of package.json file
                    Filesystem.write({
                      string: packageJsonString,
                      destination: packageJsonPath,
                      force: true
                    }).exec({
                      error: function (err){
                        return done(err);
                      },
                      success: function (){
                        return done();
                      }
                    });
                  }
                  catch (e) {
                    return done(e);
                  }
                }
              });
            }
          });
        }
      });
    }
  });

};
