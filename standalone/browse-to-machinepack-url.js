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
    noNpmUrl: {},
    noSourceUrl: {},
    noGithubUrl: {},
    noDocsUrl: {},
    noTestsUrl: {},
    success: {
      example: 'http://node-machine.org/machinepack-facebook'
    },
  },
  fn: function (inputs, exits){

    var Machines = require('machinepack-localmachinepacks');
    var util = require('util');
    var browseToUrl = require('open');
    var buildError = require('./build-error');

    Machines.readPackageJson({
      dir: process.cwd()
    }).exec({
      error: exits.error,
      notMachinepack: exits.notMachinepack,
      success: function (machinepack){
        try {

          // TODO: perhaps add other convenient things? See synonyms in the case statement below.
          // Some of that could be broken up or added to.
          var ACCEPTABLE_BROWSE_TO_WHATS = ['docs', 'npm', 'source', 'tests'];
          inputs.toWhat = inputs.toWhat || 'docs';

          // TODO:
          // ideally, we'd ping the various urls w/ a HEAD request and check
          // for a 200 response before opening the browser for a better developer experience

          var url;

          switch(inputs.toWhat.toLowerCase()) {

            case 'docs':
            case 'doc':
            case 'documentation':
            case 'manpages':
            case 'manpage':
            case 'man':
            case 'wiki':
            case 'help':
              if (!machinepack.docsUrl) {
                return exits.noDocsUrl(new Error('This machinepack is not associated with a docs URL (e.g. the URL of a public machinepack on the public machine registry at http://node-machine.org.)'));
              }
              url = machinepack.docsUrl;
              break;

            case 'npm':
            case 'package':
            case 'release':
            case 'version':
            case 'module':
              if (!machinepack.npmUrl) {
                return exits.noNpmUrl(new Error('This machinepack is not associated with a Github repo, or any kind of source code repository at all.'));
              }
              url = machinepack.npmUrl;
              break;

            case 'source':
            case 'lib':
            case 'library':
            case 'history':
            case 'changes':
            case 'issues':
            case 'commits':
            case 'sourcecode':
            case 'repo':
            case 'repository':
            case 'implementation':
            case 'code':
            case 'remote':
              if (!machinepack.sourceUrl) {
                return exits.noSourceUrl(new Error('This machinepack is not associated with a version control (e.g. source code)'));
              }
              url = machinepack.sourceUrl;
              break;

            case 'github':
            case 'hub':
            case 'git':
              if (!machinepack.githubUrl){
                if (!machinepack.githubUrl && machinepack.sourceUrl){
                  return exits.noGithubUrl(new Error('This machinepack is not associated with a Github repo- but maybe try '+machinepack.sourceUrl));
                }
                return exits.noSourceUrl(new Error('This machinepack is not associated with a Github repo, or any other kind of version-control/source repository at all.'));
              }
              url = machinepack.githubUrl;
              break;

            case 'travis':
            case 'tests':
            case 'ci':
            case 'test':
            case 'status':
              if (!machinepack.testsUrl) {
                return exits.noTestsUrl(new Error('This machinepack does not have a `testsUrl`- make sure you run `mp scrub`, or manually add the url of your testing/continuous-integration thing to the `machinepack` object in your package.json file.'));
              }
              url = machinepack.testsUrl;
              break;

            default:
              return exits.error(buildError({
                format: ['`mp browse` works w/ no arguments, but if an argument IS provided, it must be one of the following:', ACCEPTABLE_BROWSE_TO_WHATS]
              }));
          }

          browseToUrl(url);
          return exits.success(url);
        }
        catch (e) {
          return exits(e);
        }
      }
    });
  }
});
