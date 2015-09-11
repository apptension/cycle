find-cycles
===========

Simple utility for finding cycles in objects.

## Usage

```javascript
import findCycles from 'find-cycles';

let obj = {};
obj.self = obj;

findCycles(obj);
// [['$'], ['$', 'self']]
// it means that one circular object was found
// and paths to it are: $ (root) and $.self

let a = {};
let b = {};
let c = {};
let d = {};
a.dep = b;
b.dep = c;
c.dep = a;
d.dep = d;

let obj = {a,b,c,d};

findCycles(b);
// [
//   ['$', 'a'], ['$', 'a', 'dep', 'dep', 'dep'],
//   ['$', 'd'], ['$', 'd', 'dep']
// ]
// it means that two circular objects were found
// and paths to them are:
//  * $.a and $.a.dep.dep.dep
//  * $.d and $.d.dep
```

If object has the same value for couple properties but it's not circular,
empty array is returned. Objects of type Number, String, Boolean, RegExp or Date
are not considered too, it's because they do not cause circular structure
when serializing to JSON.

```javascript
let obj = new Number(1);
obj.self = obj;

findCycles(obj); // []

let a = {};
let obj = {
  a1: a,
  a2: a
};

findCycles(obj); // []
```

