/**
 * Warning: this is not a machine!
 */

module.exports = function buildError ( /* [opts or error message], <<...if first arg is string, additional args like you would pass to util.format...>> */) {

  var util = require('util');
  var _ = require('lodash');

  var _err;

  if (_.isString(arguments[0])) {
    _err = new Error(util.format.apply(util, Array.prototype.slice.call(arguments)));
    return _err;
  }
  if (_.isObject(arguments[0])) {

    // Use `message` if provided
    // (cast to string)
    if (!_.isUndefined(arguments[0].message)) {
      _err = new Error(arguments[0].message+'');
    }
    // Or if `format` array is provided, build `message` from it instead
    // (cast to string)
    else if (_.isArray(arguments[0].format)) {
      _err = new Error(util.format.apply(util, arguments[0].format)+'');
    }
    // If neither is provided, just set up an empty error
    else {
      _err = new Error();
    }

    // Use `status` if provided
    // (cast to number)
    if (!_.isUndefined(arguments[0].status) && !_.isNaN(+arguments[0].status)) {
      _err.status = +arguments[0].status;
    }

    // Use `exit` if provided, otherwise leave it undefined.
    // Also use it to set the `code`.
    if (!_.isUndefined(arguments[0].exit)){
      _err.exit = arguments[0].exit+'';
      _err.code = _err.exit;

      // Also set the `type` property to whatever `code` is
      _err.type = _err.code;
    }

    // Set the `code` property if provided.
    // (cast to string)
    if (!_.isUndefined(arguments[0].code)) {
      _err.code = arguments[0].code;
      _err.code = _err.code + '';

      // Also set the `type` property to whatever `code` is
      _err.type = _err.code;
    }
    return _err;
  }

  // If the args are all weird for some reason, just return.
  return new Error();
};
