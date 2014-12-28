#!/usr/bin/env node

/**
 * Module dependencies
 */

var Path = require('path');
var _ = require('lodash');
var program = require('commander');
var chalk = require('chalk');
var Filesystem = require('machinepack-fs');
var Machinepacks = require('machinepack-machinepacks');



program
  .usage('[options] <identity>')
  .parse(process.argv);


if (!program.args[0]) {
  console.error('`identity` required');
  process.exit(1);
}

var identity = program.args[0];

Machinepacks.getMachinesDir({
  dir: Path.resolve(process.cwd())
}).exec({
  error: function (err){
    console.error('Unexpected error occurred:\n',err);
  },
  success: function (pathToMachines){

    Filesystem.readJson({
      source: Path.resolve(process.cwd(), 'package.json')
    }).exec({
      error: function (err){
        console.error('Unexpected error occurred:\n',err);
      },
      success: function (jsonData){
        try {
          if (!_.contains(jsonData.machinepack.machines, identity)) {
            console.error('Cannot remove machine `'+chalk.red(identity)+'`.  No machine with that identity exists in this machinepack.');
            return;
          }
          jsonData.machinepack.machines = _.difference(jsonData.machinepack.machines, [identity]);
        }
        catch (e) {
          console.error('Unexpected error occurred:\n',err);
          return;
        }

        // Completely remove a file or directory (like rm -rf).
        Filesystem.rmrf({
          dir: Path.resolve(pathToMachines, identity)
        }).exec({

          error: function (err){
            console.error('Unexpected error occurred:\n',err);
          },

          success: function (){

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
                console.log('`%s` has been removed from this machinepack.', chalk.blue(identity));
              }
            });
          }
        });
      },
    });
  }
});

