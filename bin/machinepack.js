#!/usr/bin/env node

/**
 * Module dependencies
 */

var program = require('commander');
var chalk = require('chalk');


program
.version(require('../package.json').version)
.usage(chalk.gray('[options]')+' '+chalk.bold('<command>'))
.command('ls', 'list machines')
.command('add', 'add a new machine')
.command('rm <identity>', 'delete existing machine')
.command('mv <originalIdentity> <newIdentity>', 'rename machine')
.parse(process.argv);

console.log(program.help());
