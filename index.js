module.exports = require('node-machine').pack({
  pkg: {
    machinepack: {
      machines: []
    }
  },
  dir: require('path').resolve(__dirname, 'lib')
});
