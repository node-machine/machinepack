#!/usr/bin/env node

require('machine-as-script')({

  friendlyName: 'Compare machinepack',


  description:
    'Check if this machinepack satisfies the interface described by abstract pack '+
    'in another directory.',


  extendedDescription:
    'The comparison is semantic; i.e. it ignores metadata like `extendedDescription`.',


  cacheable: true,


  inputs: {

    dir: {
      description: 'The path to the machinepack directory.',
      extendedDescription: 'Absolute path recommended.  If provided path is relative, will be resolved from pwd.  Defaults to current working directory.',
      example: '/Users/mikermcneil/code/machinepack-whatever',
      defaultsTo: './'
    },

    pathToAbstractPack: {
      description: 'The path to the directory of the abstract machinepack.',
      extendedDescription: 'Absolute path recommended.  If provided path is relative, will be resolved from pwd.',
      example: '/Users/mikermcneil/code/waterline-driver-interface',
      required: true
    }
    // TODO: build in certain abstract interfaces and allow them to be referenced
    // by name as an alternative to specifying a path to an abstract pack; e.g.
    // ```
    // mp compare driver
    // mp compare db-adapter
    // mp compare fs-adapter
    // mp compare view-engine
    // # etc.
    // ```

  },


  exits: {

    notMachinepack: {
      description: 'The source path does not resolve to the root directory of a machinepack.'
    },

    notAbstractMachinepack: {
      description:
        'The provided path to the abstract pack interface does not resolve to the '+
        'root directory of an abstract machinepack.'
    },

    success: {
      outputVariableName: 'comparison',
      example: {
        errors: [{}],
        warnings: [{}],
        sourcePackInfo: { npmPackageName: 'machinepack-whatever' },
        abstractPackInfo: { npmPackageName: 'waterline-driver-interface' },
      }
    }

  },

  fn: function (inputs, exits) {

    var Path = require('path');
    var _ = require('lodash');
    var async = require('async');
    var rttc = require('rttc');
    var Machinepacks = require('machinepack-localmachinepacks');

    // Ensure inputs.dir and inputs.pathToAbstractPack are absolute paths
    // by resolving them from the current working directory.
    inputs.dir = Path.resolve(inputs.dir);
    inputs.pathToAbstractPack = Path.resolve(inputs.pathToAbstractPack);

    // Load the signatures for the source pack and the abstract pack.
    async.auto({

      source: function loadSourceMachinepack(next){
        Machinepacks.getSignature({
          dir: inputs.dir
        }).exec(next);
      },

      abstract: function loadAbstractPackInterface(next) {
        Machinepacks.getSignature({
          dir: inputs.pathToAbstractPack
        }).exec(next);
      }

    }, function afterwards(err, async_data){
      if (err) { return exits(err); }
      // console.log(async_data.abstract);


      // Now build the report which compares the two packs.
      var comparisonReport = {
        errors: [],
        warnings: [],
        sourcePackInfo: { npmPackageName: async_data.source.pack.npmPackageName },
        abstractPackInfo: { npmPackageName: async_data.abstract.pack.npmPackageName },
      };
      // comparisonReport = FIXTURE_REPRESENTING_EXAMPLE_OF_RESULTS_FROM_COMPARISON;


      // Here we look for:
      //   *WARNINGS*
      //   • unrecognized machines
      //   • unrecognized inputs
      //   • unrecognized exits
      //   *ERRORS*
      //   • missing machines
      //   • missing inputs
      //   • missing exits
      //   • incompatible machine details
      //   • incompatible inputs
      //   • incompatible exits

      // First look for unrecognized machines.
      _.each(async_data.source.machines, function (sourceMachineDef){
        var isRecognized = _.contains(_.pluck(async_data.abstract.machines, 'identity'), sourceMachineDef.identity);
        if (!isRecognized) {
          comparisonReport.warnings.push({
            problem: 'unrecognizedMachine',
            machine: sourceMachineDef.identity
          });
        }
      });


      // Then look for missing machines, inputs and exits, as well as
      // incompatible machine details, incompatible inputs, and incompatible
      // exits AND unrecognized inputs & exits.
      _.each(async_data.abstract.machines, function (abstractMachineDef){

        // Check that the machine exists.
        var sourceMachineDef = _.find(async_data.source.machines, { identity: abstractMachineDef.identity });
        if (!sourceMachineDef) {
          comparisonReport.errors.push({
            problem: 'missingMachine',
            machine: abstractMachineDef.identity
          });
          return;
        }

        // Check for incompatibilities in machine details.
        var incompatibleDetailsFound;
        var machineDetailsIncompatError = {
          problem: 'incompatibleMachineDetails',
          machine: abstractMachineDef.identity,
          expecting: {}
        };
        if (abstractMachineDef.cacheable === true) {
          if (!sourceMachineDef.cacheable) {
            incompatibleDetailsFound = true;
            machineDetailsIncompatError.expecting.sideEffects = 'cacheable';
          }
        }
        else if (abstractMachineDef.idempotent === true) {
          if (!sourceMachineDef.idempotent && !sourceMachineDef.cacheable) {
            incompatibleDetailsFound = true;
            machineDetailsIncompatError.expecting.sideEffects = 'idempotent';
          }
        }
        else {
          if (sourceMachineDef.idempotent || sourceMachineDef.cacheable) {
            incompatibleDetailsFound = true;
            machineDetailsIncompatError.expecting.sideEffects = '';
          }
        }
        if (abstractMachineDef.sync === true) {
          if (!sourceMachineDef.sync) {
            incompatibleDetailsFound = true;
            machineDetailsIncompatError.expecting.sync = true;
          }
        }
        else {
          if (sourceMachineDef.sync) {
            incompatibleDetailsFound = true;
            machineDetailsIncompatError.expecting.sync = false;
          }
        }
        if (incompatibleDetailsFound) {
          comparisonReport.errors.push(machineDetailsIncompatError);
        }







        // Check for unrecognized inputs.
        _.each(sourceMachineDef.inputs, function (unused, inputCodeName){
          var isRecognized = _.contains(_.keys(abstractMachineDef.inputs), inputCodeName);
          if (!isRecognized) {
            comparisonReport.warnings.push({
              problem: 'unrecognizedInput',
              machine: abstractMachineDef.identity,
              input: inputCodeName
            });
          }
        });



        // Check for missing or incompatible inputs.
        _.each(abstractMachineDef.inputs, function (abstractInputDef, abstractInputCodeName){

          // Missing
          var sourceInputDef = sourceMachineDef.inputs[abstractInputCodeName];
          if (!sourceInputDef) {
            comparisonReport.errors.push({
              problem: 'missingInput',
              machine: abstractMachineDef.identity,
              input: abstractInputCodeName
            });
            return;
          }

          // Incompatible
          var isIncompat;
          var abstractTypeSchema = rttc.infer(abstractInputDef.example);
          var incompatError = {
            problem: 'incompatibleInput',
            machine: abstractMachineDef.identity,
            input: abstractInputCodeName,
            expecting: {}
          };
          // should be required
          if ( abstractInputDef.required ) {
            if (!sourceInputDef.required) {
              isIncompat = true;
              incompatError.expecting.required = true;
            }
          }
          // should NOT be required
          else {
            if (sourceInputDef.required) {
              isIncompat = true;
              incompatError.expecting.required = false;
            }
          }
          // should be readOnly
          if ( abstractInputDef.readOnly ) {
            if (!sourceInputDef.readOnly) {
              isIncompat = true;
              incompatError.expecting.readOnly = true;
            }
          }
          // should NOT be readOnly
          else {
            if (sourceInputDef.readOnly) {
              isIncompat = true;
              incompatError.expecting.readOnly = false;
            }
          }
          // should be constant
          if ( abstractInputDef.constant ) {
            if (!sourceInputDef.constant) {
              isIncompat = true;
              incompatError.expecting.constant = true;
            }
          }
          // should NOT be constant
          else {
            if (sourceInputDef.constant) {
              isIncompat = true;
              incompatError.expecting.constant = false;
            }
          }
          // should have a defaultsTo
          if ( !_.isUndefined(abstractInputDef.defaultsTo) ) {
            if ( _.isUndefined(sourceInputDef.defaultsTo) ) {
              isIncompat = true;
              incompatError.expecting.defaultsTo = abstractInputDef.defaultsTo;
            }
            // and it should be like this
            else {
              var areDefaultTosEqual = rttc.isEqual( abstractInputDef.defaultsTo, sourceInputDef.defaultsTo, abstractTypeSchema );
              if (!areDefaultTosEqual) {
                isIncompat = true;
                incompatError.expecting.defaultsTo = abstractInputDef.defaultsTo;
              }
            }
          }
          // should NOT have a defaultsTo
          else {
            if ( !_.isUndefined(sourceInputDef.defaultsTo) ) {
              isIncompat = true;
              /////////////////////////////////////////////////////////////////////////////
              // Note: We might consider making this a warning instead of an error.
              /////////////////////////////////////////////////////////////////////////////
              incompatError.expecting.noDefaultsTo = '`defaultsTo` should not be specified.';
            }
          }

          // Should have an example which implies an equivalent type schema
          var sourceTypeSchema = rttc.infer(sourceInputDef.example);
          if (!_.isEqual(abstractTypeSchema, sourceTypeSchema)) {
            isIncompat = true;
            incompatError.expecting.example = abstractInputDef.example;
          }

          /////////////////////////////////////////////////////////////////////////////
          // Note: We might consider checking tolerating not-equal _but compatible_
          // type schemas (but still push warning either way).  E.g.:
          // ```
          // rttc.validate(sourceInputDef.example, abstractTypeSchema);
          // ```
          /////////////////////////////////////////////////////////////////////////////

          if (isIncompat) {
            comparisonReport.errors.push(incompatError);
          }

        });






        // Check for unrecognized exits.
        _.each(sourceMachineDef.exits, function (unused, exitCodeName){
          var isRecognized = _.contains(_.keys(abstractMachineDef.exits), exitCodeName);
          if (!isRecognized) {
            comparisonReport.warnings.push({
              problem: 'unrecognizedExit',
              machine: abstractMachineDef.identity,
              exit: exitCodeName
            });
          }
        });

        // Check for missing or incompatible exits.
        _.each(abstractMachineDef.exits, function (abstractExitDef, abstractExitCodeName){

          // Missing
          var sourceExitDef = sourceMachineDef.exits[abstractExitCodeName];
          if (!sourceExitDef) {
            comparisonReport.errors.push({
              problem: 'missingExit',
              machine: abstractMachineDef.identity,
              exit: abstractExitCodeName
            });
            return;
          }

          // Incompatible
          var isIncompat;
          var abstractTypeSchema = rttc.infer(abstractExitDef.example);
          var incompatError = {
            problem: 'incompatibleExit',
            machine: abstractMachineDef.identity,
            exit: abstractExitCodeName,
            expecting: {}
          };
          // should have a example
          if ( !_.isUndefined(abstractExitDef.example) && !_.isNull(abstractExitDef.example) ) {
            incompatError.expecting.outputStyle = 'example';
            if ( _.isUndefined(sourceExitDef.example) || _.isNull(sourceExitDef.example) ) {
              isIncompat = true;
              incompatError.expecting.example = abstractExitDef.example;
            }
            // and it should be like this
            else {
              // Should have an example which implies an equivalent type schema
              var sourceTypeSchema = rttc.infer(sourceExitDef.example);
              if (!_.isEqual(abstractTypeSchema, sourceTypeSchema)) {
                isIncompat = true;
                incompatError.expecting.example = abstractExitDef.example;
              }
              /////////////////////////////////////////////////////////////////////////////
              // Note: We might consider checking tolerating not-equal _but compatible_
              // type schemas (but still push warning either way).  E.g.:
              // ```
              // rttc.validate(sourceExitDef.example, abstractTypeSchema);
              // ```
              /////////////////////////////////////////////////////////////////////////////
            }
          }
          // should have a `like`
          else if ( !_.isUndefined(abstractExitDef.like) && !_.isNull(abstractExitDef.like) ) {
            incompatError.expecting.outputStyle = 'like';
            if ( _.isUndefined(sourceExitDef.like) || _.isNull(sourceExitDef.like) ) {
              isIncompat = true;
              incompatError.expecting.like = abstractExitDef.like;
            }
            // and it should be like this
            else {
              if (sourceExitDef.like !== abstractExitDef.like) {
                isIncompat = true;
                incompatError.expecting.like = abstractExitDef.like;
              }
            }
          }
          // should have an `itemOf`
          else if ( !_.isUndefined(abstractExitDef.itemOf) && !_.isNull(abstractExitDef.itemOf) ) {
            incompatError.expecting.outputStyle = 'itemOf';
            if ( _.isUndefined(sourceExitDef.itemOf) || _.isNull(sourceExitDef.itemOf) ) {
              isIncompat = true;
              incompatError.expecting.itemOf = abstractExitDef.itemOf;
            }
            // and it should be like this
            else {
              if (sourceExitDef.itemOf !== abstractExitDef.itemOf) {
                isIncompat = true;
                incompatError.expecting.itemOf = abstractExitDef.itemOf;
              }
            }
          }
          // should have a getExample
          else if ( !_.isUndefined(abstractExitDef.getExample) && !_.isNull(abstractExitDef.getExample) ) {
            incompatError.expecting.outputStyle = 'getExample';
            if ( _.isUndefined(sourceExitDef.getExample) || _.isNull(sourceExitDef.getExample) ) {
              isIncompat = true;
            }
          }
          // should have no output
          else {
            incompatError.expecting.outputStyle = 'void';
            if (
              ( _.isUndefined(sourceExitDef.example) || _.isNull(sourceExitDef.example) ) &&
              ( _.isUndefined(sourceExitDef.like) || _.isNull(sourceExitDef.like) ) &&
              ( _.isUndefined(sourceExitDef.itemOf) || _.isNull(sourceExitDef.itemOf) ) &&
              ( _.isUndefined(sourceExitDef.getExample) || _.isNull(sourceExitDef.getExample) )
            ) {
              isIncompat = true;
            }
          }

          if (isIncompat) {
            comparisonReport.errors.push(incompatError);
          }
        });

      });

      // Finally, return the comparison report.
      return exits.success(comparisonReport);
    });//</async.auto>
  }


}).exec({
  // An unexpected error occurred.
  error: function(err) {
    console.error('An error occurred:\n',err.stack);
  },

  // OK.
  success: function (comparison){
    var util = require('util');
    var _ = require('lodash');
    var chalk = require('chalk');
    // console.log('_____________  * * *  ~*~  * * *  _____________');
    // console.log('  * * * COMPATIBILITY REPORT * * *');

    console.log();
    console.log(
      '  %s\n'+
      '  - vs. -\n'+
      '  %s',
      chalk.bold(chalk.cyan(comparison.sourcePackInfo.npmPackageName)),
      chalk.blue(comparison.abstractPackInfo.npmPackageName)
    );
    console.log();


    console.log();
    if (comparison.errors.length > 0) {
      console.log('There are %s compatibility '+chalk.red('error(s)')+':', chalk.bold(chalk.red(comparison.errors.length)));
      console.log('-------------------------------------------------------');
    }
    else { console.log('No compatibility errors!   \\o/ '); }
    _.each(comparison.errors, function (error, i) {

      switch (error.problem) {
        case 'missingMachine':
          console.log(
            ' %d.  Missing machine (`%s`).',
            i+1, error.machine
          );
          break;


        case 'incompatibleMachineDetails':
          console.log(
            ' %d.  Incompatible machine details in `%s`.\n%sExpecting:',
            i+1, error.machine, ' '+_.repeat(' ',(i+1)/10)+'     • ', util.inspect(error.expecting, {depth: null})
          );
          console.log();
          break;


        case 'missingInput':
          console.log(
            ' %d.  Missing input (`%s`) in `%s` machine.',
            i+1, error.input, error.machine
          );
          break;


        case 'incompatibleInput':
          console.log(
            ' %d.  Incompatible input (`%s`) in `%s` machine.\n%sExpecting:',
            i+1, error.input, error.machine, ' '+_.repeat(' ',(i+1)/10)+'     • ', util.inspect(error.expecting, {depth: null})
          );
          console.log();
          break;


        case 'missingExit':
          console.log(
            ' %d.  Missing exit (`%s`) in `%s` machine.',
            i+1, error.exit, error.machine
          );
          break;


        case 'incompatibleExit':
          console.log(
            ' %d.  Incompatible exit (`%s`) in `%s` machine.\n%sExpecting:',
            i+1, error.exit, error.machine, ' '+_.repeat(' ',(i+1)/10)+'     • ', util.inspect(error.expecting, {depth: null})
          );
          console.log();
          break;


        default: throw new Error('Consistency violation: Unrecognized problem code (`'+error.problem+'`)');
      }
    });//</each error>

    console.log();
    if (comparison.warnings.length > 0) {
      console.log('There are %s compatibility '+chalk.yellow('warning(s)')+':', chalk.bold(chalk.yellow(comparison.warnings.length)));
      console.log('-------------------------------------------------------');
    }
    else { console.log('No compatibility warnings!   \\o/ '); }
    _.each(comparison.warnings, function (warning, i) {
      switch (warning.problem) {
        case 'unrecognizedMachine':
          console.log(
            ' %d.  Unrecognized machine (`%s`).',
            i+1, warning.machine
          );
          break;
        case 'unrecognizedInput':
          console.log(
            ' %d.  Unrecognized input (`%s`) in `%s` machine.',
            i+1, warning.input, warning.machine
          );
          break;
        case 'unrecognizedExit':
          console.log(
            ' %d.  Unrecognized exit (`%s`) in `%s` machine.',
            i+1, warning.exit, warning.machine
          );
          break;
        default: throw new Error('Consistency violation: Unrecognized problem code (`'+warning.problem+'`)');
      }
    });//</each warning>

    // TODO (as time permits): prettify and/or group output
    //
    // e.g.
    // ```
    // * * * * * * * * * * * * * * * * * * * * * * * * * * *
    // Comparison report:
    // -----------------------------------------------------
    // `machinepack-whatever`
    //  - vs. -
    // `waterline-driver-interface` (an abstract pack)
    // * * * * * * * * * * * * * * * * * * * * * * * * * * *
    //
    // • Missing 2 machine(s):
    //   ° eat-with-spoon
    //   ° eat-with-chopsticks
    //
    // • `eat-with-fork` machine has 4 issue(s):
    //   ° Incompatible machine details:
    //       => Expecting `cacheable: true`
    //       => Expecting `sync: false`
    //   ° Missing 1 input(s):
    //       => `numProngs`
    //   ° Missing 1 exit(s):
    //       => `accidentallyPokedUser`
    //   ° 3 incompatible exit(s):
    //       => `success`
    //          - Example must imply the following type schema:
    //            {
    //              gramsConsumed: 'number',
    //              stillHungry: 'boolean'
    //            }
    //       => `foodTooSpoiled`
    //          - Must specify `like: 'food'`
    //       => `lostProngAndAccidentallyAteIt`
    //          - Must specify `getExample`
    //
    // • ...and so forth
    // ```
    //

    console.log();
    console.log();
  }
});




//  // FAKE
// var FIXTURE_REPRESENTING_EXAMPLE_OF_RESULTS_FROM_COMPARISON = {

//   // Note that where we see a dictionary of `expected` things below,
//   // the properties in that dictionary should only exist if that aspect
//   // of the input/exit/machine are incorrect.  For example, if an input
//   // is supposed to be required and have a numeric example, and the example
//   // is correct but the input is optional, then we'd see:
//   // ```
//   // expected: {
//   //   required: true
//   // }
//   // ```

//   // breaking:
//   errors: [
//     // MACHINE-RELATED-STUFF
//     { problem: 'missingMachine', machine: 'eat-with-spoon' },
//     {
//       problem: 'incompatibleMachineDetails',
//       machine: 'eat-with-fork',
//       expected: {
//         sideEffects: '',// ("" or "idempotent" or "cacheable")
//         sync: false
//       }
//     },

//     // INPUT-RELATED-STUFF
//     { problem: 'missingInput', machine: 'eat-with-fork', input: 'numProngs' },
//     {
//       problem: 'incompatibleInput',
//       machine: 'eat-with-fork',
//       input: 'food',
//       expecting: {
//         example: { calories: 3293, liveDbConnection: '===' },
//         readOnly: true
//       }
//     },
//     {
//       problem: 'incompatibleInput',
//       machine: 'eat-with-fork',
//       input: 'forkDepotStreetAddress',
//       expecting: {
//         required: false,
//         constant: true,
//         defaultsTo: '300 Forkimus Ave.'
//       }
//     },
//     // Note that input contracts are not currently supported,
//     // and when they are, they should probably be handled by
//     // a separate problem code.



//     // EXIT-RELATED-STUFF
//     { problem: 'missingExit', machine: 'eat-with-fork', exit: 'accidentallyPokedUser' },
//     {
//       problem: 'incompatibleExit',
//       machine: 'eat-with-fork',
//       exit: 'foodTooDry',
//       expecting: {
//         outputStyle: 'void'
//         // (^means that exit has like/itemOf/getExample/example,
//         //  but it was supposed to have none of those)
//       }
//     },
//     {
//       problem: 'incompatibleExit',
//       machine: 'eat-with-fork',
//       exit: 'success',
//       expecting: {
//         outputStyle: 'example',
//         // (^means that exit was supposed to have example,
//         //   but instead it has like,itemOf,getExample,or nothing)
//         example: { gramsConsumed: 39, stillHungry: true }
//         // in this case we also include `example`.  If the exit
//         // has an example, and it just isn't compatible, then
//         // we would _only_ include `example` (i.e. we'd omit
//         // `outputStyle` since that aspect would be accurate)
//       }
//     },
//     {
//       problem: 'incompatibleExit',
//       machine: 'eat-with-fork',
//       exit: 'lostProngAndAccidentallyAteIt',
//       expecting: {
//         outputStyle: 'getExample'
//         // (^means that exit was supposed to have getExample(),
//         //   but instead it has like,itemOf,example,or nothing)
//       }
//     },
//     { problem: 'incompatibleExit',
//       machine: 'eat-with-fork',
//       exit: 'foodTooSpoiled',
//       expecting: {
//         outputStyle: 'like',
//         // (^means that exit was supposed to have like,
//         //  but instead it has itemOf,example,getExample,or nothing.
//         like: 'food'
//         // in this case we also include `like`.  If the exit
//         // has a `like`, and it just isn't the right input id, then
//         // we would _only_ include `like` (i.e. we'd omit
//         // `outputStyle` since that aspect would be accurate)
//       }
//       // Note that `outputStyle: 'itemOf'` and e.g. `itemOf: 'foods'`
//       // work exactly the same way.
//     }
//   ],

//   // non-breaking:
//   warnings: [
//     { problem: 'unrecognizedMachine', machine: 'eat-with-lawnmower' },
//     { problem: 'unrecognizedInput', machine: 'eat-with-other-utensil', input: 'utensilName' },
//     { problem: 'unrecognizedExit', machine: 'eat-with-other-utensil', exit: 'tooPorous' },
//     // note: could potentially allow _compatible_ types and have them show up
//     // as warnings here instead of errors-- but decided against doing that for now
//     // in the interest of specificity/correctness.
//   ]
// };
