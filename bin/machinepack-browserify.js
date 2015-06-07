#!/usr/bin/env node

require('machine-as-script')({

  friendlyName: 'Bundle machinepack',


  description: 'Bundle the specified machinepack into a single JavaScript string for use in the browser.',


  extendedDescription: 'The browserified JavaScript will be exposed within a [umd](https://github.com/forbeslindesay/umd) wrapper.',


  cacheable: true,


  inputs: {

    dir: {
      description: 'The absolute path to the machinepack directory (if path is relative, will be resolved from pwd).  Defaults to current working directory.',
      example: '/Users/mikermcneil/machinepack-whatever',
      defaultsTo: './'
    },

    exportAs: {
      description: 'The variable name under which to expose this machinepack; either on the `window` global, or using the semantics of another detected module system (like AMD/RequireJS).',
      extendedDescription: 'If left unspecified, this will be the `friendlyName` of the machinepack.',
      example: 'Whatever'
    },

    destination: {
      description: 'An optional destination path for the browserified output script. Defaults to "./for-browser.js" in the current directory.',
      example: './for-browser.js',
      defaultsTo: './for-browser.js'
    }

  },


  exits: {

    notMachinepack: {
      description: 'The specified path is not the root directory of a machinepack'
    },

    success: {
      variableName: 'outputPath',
      example: 'The output path where the browserified code file was written.'
    },

  },

  fn: function (inputs, exits) {

    var Path = require('path');
    var MPBrowserify = require('machinepack-browserify');
    var MPMachines = require('machinepack-machines');
    var Filesystem = require('machinepack-fs');

    // Ensure inputs.dir and inputs.destination are absolute paths
    // by resolving them from the current working directory.
    inputs.dir = Path.resolve(inputs.dir);
    inputs.destination = Path.resolve(inputs.destination);

    // Read and parse the package.json file of the local pack in the specified directory.
    MPMachines.readPackageJson({
      dir: inputs.dir
    }).exec({

      // An unexpected error occurred.
      error: exits.error,

      // The specified path is not the root directory of a machinepack
      notMachinepack: exits.notMachinepack,

      // OK.
      success: function(packMetadata) {

        // Handle case where `exportAs` input was left unspecified.
        if (typeof inputs.exportAs === 'undefined') {
          inputs.exportAs = packMetadata.variableName;
        }

        // Bundle the machinepack and its dependenies into a single JavaScript file for use on the client.
        MPBrowserify.bundle({
          path: inputs.dir,
          exportAs: inputs.exportAs
        }).exec({
          // An unexpected error occurred.
          error: exits.error,
          // OK.
          success: function (code) {

            // Generate a file on the local filesystem using the specified utf8 string as its contents.
            Filesystem.write({
              destination: inputs.destination,
              string: code,
              force: true
            }).exec({
              // An unexpected error occurred.
              error: exits.error,
              // OK.
              success: function() {
                return exits.success(inputs.destination);
              }
            });

          }
        });
      }
    });
  }
}).exec({
  // An unexpected error occurred.
  error: function(err) {
    console.error('An error occurred:\n',err.stack);
  },

  // OK.
  success: function (outputPath){
    console.log('New JavaScript file which exposes a browser-ready version of this pack has been created at "%s".',outputPath);
    console.log('To load onto page, just include w/ normal <script> tag, e.g.');
    console.log('<script type="text/javascript" src="./for-browser.js"></script>');
    console.log();
    console.log('For usage information, see:\nhttp://node-machine.org/machinepack-browserify/bundle-machinepack');
  }
});

