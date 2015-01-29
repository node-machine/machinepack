#!/usr/bin/env node

/**
 * Module dependencies
 */

var util = require('util');
var program = require('commander');
var chalk = require('chalk');
var _ = require('lodash');


var VERSION = require('../package.json').version;



program
.version(VERSION)
// Allow unknown options.
.unknownOption = function NOOP(){};
program.usage(chalk.gray('[options]')+' '+chalk.bold('<command>'))
.command('browse', 'view on node-machine.org')
.command('info', 'get pack metadata')
.command('ls', 'list machines')
.command('add', 'add a new machine')
.command('exec <identity>', 'run machine')
.command('rm <identity>', 'delete existing machine')
.command('mv <originalIdentity> <newIdentity>', 'rename machine')
.command('cp <originalIdentity> <newIdentity>', 'copy machine')
.command('init', 'make this module a machinepack')
.command('about', 'about this module')
.parse(process.argv);


// When `machinepack help` is called, `program.help()` is triggered automatically by commander.
// To trigger `help` manually:
// program.outputHelp();


// $ machinepack
//
// (i.e. with no CLI arguments...)
if (program.args.length === 0) {
  return _alias('about');
}


// $ machinepack ls
// $ machinepack cp
// ...
//
// (i.e. matched one of the overtly exposed commands)
var matchedCommand = !!program.runningCommand;
if (matchedCommand){
  return;
}


// $ machinepack *
//
// (i.e. check aliases, since wasn't matched by any overtly exposed commands)
if (program.args[0] === 'list' || program.args[0] === 'machines') {
  return _alias('ls');
}
if (program.args[0] === 'initialize' || program.args[0] === 'new') {
  return _alias('init');
}
if (program.args[0] === 'remove') {
  return _alias('rm');
}
if (program.args[0] === 'run' || program.args[0] === 'test') {
  return _alias('exec');
}
if (program.args[0] === 'touch') {
  return _alias('add');
}
if (program.args[0] === 'move') {
  return _alias('mv');
}
if (program.args[0] === 'copy') {
  return _alias('cp');
}
if (program.args[0] === 'man') {
  return _alias('info');
}
if (program.args[0] === 'show') {
  return _alias('browse');
}


// $ machinepack *
//
// (i.e. final handler)
(function unknownCommand(){

  // Display usage (i.e. "help"):
  program.outputHelp();
})();












/**
 * Helper fn
 * @param  {String} aliasFor [string command to redirect to]
 */
function _alias (aliasFor){
  process.argv.splice(process.argv.indexOf(program.args[0]),1);
  require('./machinepack-'+aliasFor);
}
