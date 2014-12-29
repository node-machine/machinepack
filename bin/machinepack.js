#!/usr/bin/env node

/**
 * Module dependencies
 */

var program = require('commander');
var chalk = require('chalk');
var _ = require('lodash');


program
.version(require('../package.json').version)
// Allow unknown options.
.unknownOption = function NOOP(){};
program.usage(chalk.gray('[options]')+' '+chalk.bold('<command>'))
.command('init', 'make this a machinepack')
.command('ls', 'list machines')
.command('add', 'add a new machine')
.command('exec <identity>', 'run machine')
.command('rm <identity>', 'delete existing machine')
.command('mv <originalIdentity> <newIdentity>', 'rename machine')
.command('cp <originalIdentity> <newIdentity>', 'copy machine')
.parse(process.argv);


if (program.args.length === 0) {
  console.log(program.help());
}


// Aliases:
if (program.args[0] === 'list' || program.args[0] === 'machines') {
  return _alias('ls');
}
if (program.args[0] === 'initialize' || program.args[0] === 'new') {
  return _alias('init');
}
if (program.args[0] === 'remove') {
  return _alias('rm');
}
if (program.args[0] === 'run') {
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



function _alias (aliasFor){
  process.argv.splice(process.argv.indexOf(program.args[0]),1);
  require('./machinepack-'+aliasFor);
}
