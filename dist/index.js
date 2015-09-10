'use strict';

var hasOwnProperty = function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};
var isArray = Array.isArray;

module.exports = function findCycles(obj) {
  // Keep a reference to each unique object or array
  var objects = [];
  // Keep the path to each unique object or array
  var paths = [];
  var circularPaths = [];

  (function traverse(value, path) {
    // check only values that can be circular when stringifying to JSON
    if (typeof value === 'object' && value !== null && !(value instanceof Boolean) && !(value instanceof Date) && !(value instanceof Number) && !(value instanceof RegExp) && !(value instanceof String)) {
      // The loop counter
      var i;
      for (i = 0; i < objects.length; i++) {
        // mark path as circular if object was seen before
        // add path to it!
        if (objects[i] === value) {
          paths[i].push([path]);
          circularPaths.push(paths[i]);
        } else {
          // otherwise, save reference to the object
          // save the first path it was found under
          objects.push(value);
          paths.push([path]);
        }
      }

      if (isArray(value)) {
        for (i = 0; i < value.length; i += 1) {
          traverse(value[i], path + '[' + i + ']');
        }
      } else {
        for (var name in value) {
          if (hasOwnProperty(value, name)) {
            traverse(value[name], path + '[' + name + ']');
          }
        }
      }
    }
  })(obj, '$');

  return circularPaths;
};