'use strict';

var hasOwnProperty = function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};
var isArray = Array.isArray;
var comparePaths = function comparePaths(p1, p2) {
  if (p1.length === 1 || p2.length === 1) {
    // root path has common part with every path
    return true;
  }

  var longer = p1.length > p2.length ? p1 : p2;
  var shorter = p1.length <= p2.length ? p1 : p2;

  // start from 1 to not compare root
  for (var i = 1, maxi = shorter.length; i < maxi; i++) {
    if (shorter[i] !== longer[i]) {
      return false;
    }
  }

  return true;
};

module.exports = function findCycles(obj) {
  // Keep a reference to each unique object or array
  var objects = [];
  // Keep the path to each unique object or array
  var paths = [];
  var doubledEntries = [];

  (function traverse(value, path) {
    // check only values that can be circular when stringifying to JSON
    if (typeof value === 'object' && value !== null && !(value instanceof Boolean) && !(value instanceof Date) && !(value instanceof Number) && !(value instanceof RegExp) && !(value instanceof String)) {
      var i;
      for (i = 0; i < objects.length; i++) {
        // mark path as circular if object was seen before
        // add path to it!
        if (objects[i] === value) {
          paths[i].push(path);

          if (doubledEntries.indexOf(paths[i]) === -1) {
            doubledEntries.push(paths[i]);
          }

          return;
        }
      }

      // otherwise, save reference to the object
      // save the first path it was found under
      objects.push(value);
      paths.push([path]);

      if (isArray(value)) {
        for (i = 0; i < value.length; i += 1) {
          traverse(value[i], path.concat([i.toString()]));
        }
      } else {
        for (var name in value) {
          if (hasOwnProperty(value, name)) {
            traverse(value[name], path.concat([name.toString()]));
          }
        }
      }
    }
  })(obj, ['$']);

  return doubledEntries.map(function (pathsForObject) {
    return pathsForObject.filter(function (p1) {
      return pathsForObject.filter(function (p2) {
        return p2 !== p1;
      }).some(function (p2) {
        return comparePaths(p1, p2);
      });
    });
  }).filter(function (pathsForObject) {
    return pathsForObject.length;
  });
};
