module.exports = require('machine').build({
  identity: 'browse-to-machinepack-url',
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

    var Machines = require('machinepack-machines');
    var util = require('util');
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
              if (!machinepack.githubUrl){
                if (!machinepack.githubUrl && machinepack.sourceCodeUrl){
                  return exits.noGithubUrl(new Error(util.format('This machinepack is not associated with a Travis URL- but maybe try %s?',machinepack.sourceCodeUrl)));
                }
                return exits.noSourceCodeUrl(new Error('This machinepack is not associated with a Github repo, or any kind of source code repository at all.'));
              }
              url = machinepack.githubUrl;
              break;

            case 'tests':
            case 'test':
            case 'ci':
            case 'status':
              if (!machinepack.testsUrl) {
                return exits.noTestsUrl(new Error('This machinepack is not associated with a Travis URL, or any kind of source code repository at all.'));
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
});
