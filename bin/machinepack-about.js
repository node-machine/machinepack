#!/usr/bin/env node

/**
 * Module dependencies
 */

var util = require('util');
var program = require('commander');
var chalk = require('chalk');



var VERSION = require('../package.json').version;



program
  .usage('[options] <command>')
  .parse(process.argv);


var ABOUT = util.format(
'                '+'\n'+
'   ______       '+'\n'+
'  /      \\      %s'+'\n'+
' /  %s  %s  \\     %s'+'\n'+
' \\        /                        '+'\n'+
'  \\______/      %s                   '+'\n'+
'                                        ',
// Strings
chalk.bold(chalk.cyan('machinepack'))+chalk.reset(' (CLI Tool)'),
chalk.bold('|'),chalk.bold('|'),
chalk.gray('v'+VERSION),
chalk.underline('http://node-machine.org')
);

console.log(ABOUT);

program.outputHelp();
console.log();
