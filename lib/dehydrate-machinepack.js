
/**
 * Module dependencies
 */

var Path = require('path');
var NodeMachine = require('node-machine');
var Filesystem = require('machinepack-fs');



module.exports = {

  fn: function (dir) {
    Filesystem.ls(dir, function(err, paths) {
      if (err) {
        console.error('Error listing contents of "%s":', dir);
        console.error(err);
        return;
      }

      var machinepack = NodeMachine.pack({
        pkg: {
          machinepack: {
            machines: _.map(_.where(paths, function(path) {
              return path.match(/\.js$/);
            }), function(path) {
              return Path.basename(path, '.js');
            })
          }
        },
        dir: dir
      });


      var stringified = JSON.stringify(machinepack);
      console.log('Success!');
      console.log(stringified);
    });
  }
};
