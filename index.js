/**
 * Module dependencies
 */

var NodeMachine = require('node-machine');


module.exports = NodeMachine.pack({
  pkg: {
    machinepack: {
      machines: [
        'dehydrate-machinepack'
      ]
    }
  },
  dir: require('path').resolve(__dirname, 'lib')
});
