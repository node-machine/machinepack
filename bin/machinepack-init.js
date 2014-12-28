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
  .usage('[options]')
  .parse(process.argv);

Machinepacks.promptAboutNewMachinepack().exec({
  error: function (err){
    console.error('Unexpected error occurred:\n', err);
  },
  then: function (metadata){
    Filesystem.readJson({
      source: Path.resolve(process.cwd(), 'package.json')
    }).exec({
      error: function (err){
        console.error('Unexpected error occurred:\n',err);
      },
      success: function (jsonData){
        jsonData.machinepack = jsonData.machinepack || {};
        jsonData.machinepack.friendlyName = metadata.friendlyName || jsonData.machinepack.friendlyName;
        jsonData.machinepack.machines = jsonData.machinepack.machines || [];
        jsonData.description = metadata.description || jsonData.description;
        jsonData.machinepack.machineDir = jsonData.machinepack.machineDir || 'machines/';

        (function (done){
          Filesystem.mkdir({
            destination: jsonData.machinepack.machineDir
          }).exec({
            error: function (err){
              return done(err);
            },
            // If something already exists at the machine directory path, no problem,
            // just ignore it and continue.
            alreadyExists: function (){
              return done();
            },
            success: function (){
              return done();
            }
          });
        })(function (err) {
          if (err){
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
              console.log('Initialized current module as a machinepack');
            }
          });
        });
      }
    });
  }
});

