#!/usr/bin/env node

/**
 * Module dependencies
 */

var program = require('commander');
var chalk = require('chalk');

program
.usage('[options]')
.parse(process.argv);



var scrubPack = require('machine').build({
  identity: 'browse-to-machinepack-url',
  sync: true,
  inputs: {
    dir: {
      example: '/Users/mikermcneil/machinepack-foo/',
      required: true
    }
  },
  defaultExit: 'success',
  exits: {
    error: {},
    notMachinepack: {},
    success: {
      example: 'http://node-machine.org/machinepack-facebook'
    },
  },
  fn: function (inputs, exits) {

    var path = require('path');
    var util = require('util');
    var Machines = require('machinepack-machines');
    var Filesystem = require('machinepack-fs');
    var gi = require('git-info');

    // IDEA: if a machine file exists in the machines folder, but is not in the package.json, add it?  not sure if this would actually be a good thing. probably as a different command...?

    // Resolve provided `dir` path from cwd if it's relative
    inputs.dir = path.resolve(inputs.dir);

    var packageJsonPath = path.resolve(inputs.dir, 'package.json');

    // Ensure package.json file has proper `npm test` script and devDependency on `test-machinepack-mocha`:
    Filesystem.read({
      source: packageJsonPath,
    }).exec({
      // An unexpected error occurred.
      error: exits.error,
      // No file exists at the provided `source` path
      doesNotExist: exits.notMachinepack,
      // OK.
      success: function(jsonString) {

        var jsonData;
        try {
          jsonData = JSON.parse(jsonString);

          // Ensure a devDependency exists for test-machinepack-mocha
          jsonData.devDependencies = jsonData.devDependencies||{};
          jsonData.devDependencies['test-machinepack-mocha'] = '^0.2.2';
          // Ensure a script exists for use with `npm test`
          jsonData.scripts = jsonData.scripts||{};
          jsonData.scripts.test = 'node ./node_modules/test-machinepack-mocha/bin/testmachinepack-mocha.js';
        }
        catch (e) {
          return exits.error(buildError('Unexpected error parsing or modifying package.json data:\n', e));
        }


        // While we're here, see if there's anything exciting in the git directory and
        // update the package.json file with the repo url if we can get it.
        gi('repository', function(err, repoInfo) {

          // Ignore errors-- just use the repo url if we can get it, otherwise ignore it.
          if (err) { }
          else {
            try {
              jsonData.repository = {
                type: 'git',
                url: repoInfo.repository
              };
            }
            catch (e) {}
          }

          // Now take a guess at a `testsUrl` and add it to the `machinepack` object
          // in the package.json data (unless one already exists)
          try {
            if (!jsonData.machinepack.testsUrl) {
              // Assume github conventions and rip out metadata by matching against the
              // `owner/reponame` pattern in the repo URL
              var ownerRepoStr = jsonData.repository.url.replace(/^.*github\.com[:\/]/, '');
              ownerRepoStr = ownerRepoStr.replace(/^\/*/, '');
              ownerRepoStr = ownerRepoStr.replace(/\.git$/, '');
              ownerRepoStr = ownerRepoStr.replace(/\/*$/, '');

              // Build tests URL using the ownerRepo string and assuming test runner is Travis CI.
              jsonData.machinepack.testsUrl = util.format('https://travis-ci.org/%s',ownerRepoStr);
            }
          }
          catch (e) {}

          Filesystem.writeJson({
            json: jsonData,
            destination: packageJsonPath,
            force: true
          }).exec({

            // An unexpected error occurred.
            error: exits.error,

            // OK.
            success: function (){

              // Ensure tests exist for each machine (don't overwrite any test files which already exist though)
              Machines.scaffoldTests({
                dir: inputs.dir
              }, {
                error: exits.error,
                notMachinepack: exits.notMachinepack,
                success: function (){

                  // Copy file or directory located at source path to the destination path.
                  Filesystem.cp({
                    source: path.resolve(__dirname,'../templates/travis.template.yml'),
                    destination: path.resolve(inputs.dir, '.travis.yml'),
                  }).exec({
                    // An unexpected error occurred.
                    error: exits.error,
                    // OK.
                    success: function() {
                      // (Re)generate a README file using the boilerplate, using fresh description and module name from package.json.
                      //  --> (read file at source path, replace substrings with provided data, then write to destination path.)
                      Filesystem.template({
                        source: path.resolve(__dirname,'../templates/README.template.md'),
                        destination: path.resolve(inputs.dir, 'README.md'),
                        data: {
                          moduleName: jsonData.name,
                          description: jsonData.description,
                          copyrightYear: (new Date()).getFullYear(),
                          author: jsonData.author,
                          license: jsonData.license||'MIT'
                        },
                        force: true
                      }).exec({
                        // An unexpected error occurred.
                        error: exits.error,
                        // OK.
                        success: exits.success
                      });
                    }
                  });
                }
              });
            }
          });
        });

      },
    });

  }
});



scrubPack({
  dir: process.cwd()
}).exec({
  error: function (err){
    console.error('Unexpected error occurred:\n', err);
  },
  notMachinepack: function() {
    console.error('This is '+chalk.red('not a machinepack')+'.');
    console.error('Be sure and check that the package.json file has a valid `machinepack` property, or run `machinepack init` if you aren\'t sure.');
  },
  success: function() {
    console.log();
    console.log('Whew! I gave this pack a good scrubbing.\n');
    console.log(
      ' • regenerated the README.md file using the latest info from your package.json file\n'+
      ' • made sure your package.json file has a repo url in it; assuming this pack has a local repo (i.e. `.git` folder)\n'+
      ' • double-checked that each machine in this pack has a test in the tests folder and created new ones if necessary\n'+
      ' • ensured a `devDependency` on the proper version of `test-machinepack-mocha` in your package.json file\n'+
      ' • ensured you have the proper `npm test` script in your package.json file\n',
      ' • ensured you have a .travis.yml file (note that you\'ll still need to enable the repo in on travis-ci.org)\n'+
      ' • attempted to infer a `testsUrl` and, if successful, added it to your package.json file\n'
    );
    console.log();
  },
});
