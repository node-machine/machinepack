#!/usr/bin/env node

/**
 * Module dependencies
 */

var program = require('commander');
var chalk = require('chalk');


program
.version(require('../package.json').version)
.usage(chalk.gray('[options]')+' '+chalk.bold('<command>'))
.command('init', 'initialize the current module as a machinepack')
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
if (program.args[0] === 'machines') {
  program.args[0] = 'ls';
}
