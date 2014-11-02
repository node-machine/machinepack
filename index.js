/**
 * Module dependencies
 */

var NodeMachine = require('node-machine');


module.exports = NodeMachine.pack({
  pkg: require('./package.json'),
  dir: require('path').resolve(__dirname, 'lib')
});
