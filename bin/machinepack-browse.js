#!/usr/bin/env node

/**
 * Module dependencies
 */

var program = require('commander');
var chalk = require('chalk');
var Machines = require('machinepack-machines');


program
  .usage('[options] [toWhat]')
  .parse(process.argv);


// If CLI argument was provided, use it as the browsing "type"
var toWhat = program.args[0];

require('machine').build({
  sync: true,
  inputs: {
    dir: {
      example: '/Users/mikermcneil/machinepack-foo/'
    },
    toWhat: {
      example: 'npm',
    }
  },
  defaultExit: 'success',
  exits: {
    error: {},
    notMachinepack: {},
    success: {},
    noNpmUrl: {},
    noSourceCodeUrl: {},
    noGithubUrl: {},
    noNodeMachineUrl: {},
    noTestsUrl: {}
  },
  fn: function (inputs, exits){

    var browseToUrl = require('open');

    Machines.readPackageJson({
      dir: process.cwd()
    }).exec({
      error: exits.error,
      notMachinepack: exits.notMachinepack,
      success: function (machinepack){
        try {

          // TODO: perhaps add other convenient things?
          var ACCEPTABLE_BROWSE_TO_WHATS = ['docs', 'npm', 'repo', 'travis', 'issues'];
          inputs.toWhat = inputs.toWhat || 'docs';

          // TODO:
          // ideally, we'd ping the various urls w/ a HEAD request and check
          // for a 200 response before opening the browser for a better developer experience

          var url;

          switch(inputs.toWhat.toLowerCase()) {

            case 'docs':
            case 'doc':
            case 'documentation':
            case 'manpage':
            case 'man':
            case 'help':
              if (!machinepack.nodeMachineUrl) {
                return exits.noNodeMachineUrl(new Error('This machinepack is not associated with a public machinepack on the public machine registry at http://node-machine.org.'));
              }
              url = machinepack.nodeMachineUrl;
              break;

            case 'npm':
            case 'package':
            case 'module':
              if (!machinepack.npmUrl) {
                return exits.noNpmUrl(new Error('This machinepack is not associated with a Github repo, or any kind of source code repository at all.'));
              }
              url = machinepack.npmUrl;
              break;

            case 'repo':
            case 'repository':
            case 'sourcecode':
            case 'code':
            case 'source':
            case 'remote':
              if (!machinepack.sourceCodeUrl) {
                return exits.noSourceCodeUrl(new Error('This machinepack is not associated with a Github repo, or any kind of source code repository at all.'));
              }
              url = machinepack.sourceCodeUrl;
              break;

            case 'github':
            case 'hub':
            case 'git':
              if (!machinepack.githubUrl){
                if (!machinepack.githubUrl && machinepack.sourceCodeUrl){
                  return exits.noGithubUrl(new Error('This machinepack is not associated with a Github repo- maybe try '+machinepack.sourceCodeUrl));
                }
                return exits.noSourceCodeUrl(new Error('This machinepack is not associated with a Github repo, or any kind of source code repository at all.'));
              }
              url = machinepack.githubUrl;
              break;

            case 'travis':
            case 'tests':
            case 'test':
            case 'ci':
            case 'status':
              if (!machinepack.testsUrl) {
                return exits.noTestsUrl(new Error('This machinepack is not associated with a Github repo, or any kind of source code repository at all.'));
              }
              url = machinepack.testsUrl;
              break;

            default:
              return exits.error('`mp browse` works w/ no arguments, but if an argument IS provided, it must be one of the following:' + ACCEPTABLE_BROWSE_TO_WHATS);
          }

          browseToUrl(url);
          return exits.success();
        }
        catch (e) {
          return exits(e);
        }
      }
    });
  }
})({
  dir: process.cwd()
}).exec({
  error: function(err) {
    console.error(chalk.red('Unexpected error occurred:\n'), err);
  },
  notMachinepack: function() {
    console.error('This is ' + chalk.red('not a machinepack') + '.');
    console.error('Be sure and check that the package.json file has a valid `machinepack` property, or run `machinepack init` if you aren\'t sure.');
  },
  success: function(url) {
    console.log('Opening %s...',chalk.underline(url));
  }
});
