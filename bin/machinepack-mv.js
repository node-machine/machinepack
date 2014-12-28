#!/usr/bin/env node

/**
 * Module dependencies
 */

var Path = require('path');
var _ = require('lodash');
var program = require('commander');
var Filesystem = require('machinepack-fs');
var Machinepacks = require('machinepack-machinepacks');


program
  .usage('[options] <originalIdentity> <newIdentity>')
  .parse(process.argv);


var originalIdentity = program.args[0];
if (!originalIdentity) {
  console.error('`originalIdentity` required');
  process.exit(1);
}

var newIdentity = program.args[1];
if (!newIdentity) {
  console.error('`newIdentity` required');
  process.exit(1);
}



// TODO:
// Machinepacks.moveMachine({
//   source: originalIdentity,
//   destination: newIdentity,
//   dir: process.cwd()
// }).exec({
//   error: function (err){
//     console.error('Unexpected error occurred:\n',err);
//   },
//   success: function (){
//     console.log('Machine with former identity: `%s` is now: `%s`', originalIdentity, newIdentity);
//   }
// });



Machinepacks.getMachinesDir({
  dir: Path.resolve(process.cwd())
}).exec({
  error: function (err){
    console.error('Unexpected error occurred:\n',err);
  },
  success: function (pathToMachines){

    Filesystem.mv({
      source: Path.resolve(pathToMachines, originalIdentity+'.js'),
      destination: Path.resolve(pathToMachines, newIdentity+'.js')
    }).exec({

      error: function (err){
        console.error('Unexpected error occurred:\n',err);
      },

      success: function (){

        Filesystem.readJson({
          source: Path.resolve(process.cwd(), 'package.json')
        }).exec({
          error: function (err){
            console.error('Unexpected error occurred:\n',err);
          },
          success: function (jsonData){
            try {
              jsonData.machinepack.machines = _.difference(jsonData.machinepack.machines, [originalIdentity]);
              jsonData.machinepack.machines = _.union(jsonData.machinepack.machines, [newIdentity]);
            }
            catch (e) {
              console.error('Unexpected error occurred:\n',err);
              return;
            }
            Filesystem.writeJson({
              json: jsonData,
              destination: Path.resolve(process.cwd(), 'package.json'),
              force: true
            }).exec({
              error: function (err){
                console.error('Unexpected error occurred:\n',err);
              },
              success: function (){
                // Done.
                console.log('Machine with former identity: `%s` is now: `%s`', originalIdentity, newIdentity);
              }
            });
          }
        });
      },
    });
  }
});

