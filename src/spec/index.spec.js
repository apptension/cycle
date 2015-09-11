import {assert} from 'chai';
import findCycles from '../index.js';


function joinAll(arr) {
  return arr.map((el) => el.join('.'));
}

suite('API', () => {
  test('should be a function', () => {
    assert.isFunction(findCycles);
  });

  test('should not throw for non-object values', () => {
    assert.doesNotThrow(() => findCycles());
    assert.doesNotThrow(() => findCycles(null));
    assert.doesNotThrow(() => findCycles(44));
    assert.doesNotThrow(() => findCycles('abc'));
    assert.doesNotThrow(() => findCycles(function () {}));
    assert.doesNotThrow(() => findCycles(true));
    assert.doesNotThrow(() => findCycles(NaN));
  });

  test('should always return an array', () => {
    let obj = {};
    obj.prop = obj;

    assert.isArray(findCycles(obj));
    assert.isArray(findCycles({}));
    assert.isArray(findCycles(null));
    assert.isArray(findCycles(44));
    assert.isArray(findCycles('abc'));
    assert.isArray(findCycles(function () {}));
    assert.isArray(findCycles(true));
    assert.isArray(findCycles(NaN));
  });
});

suite('finding cycles', () => {
  test('should not find cycle when there is no cycle', () => {
    let obj = {};
    obj.self = {a: 'a'};
    let output = findCycles(obj);
    assert.equal(output.length, 0);
  });

  test(`should not find cycle when the same object can be found in tree
  several times, but there is no cycle`, () => {
    let a = {};
    let obj = {};
    obj.a1 = a;
    obj.a2 = a;
    let output = findCycles(obj);
    assert.equal(output.length, 0);
  });

  test('should not find cycle when cyclic object is a number', () => {
    let obj = new Number(4);
    obj.self = obj;
    let output = findCycles(obj);
    assert.equal(output.length, 0);
  });

  test('should not find cycle when cyclic object is a string', () => {
    let obj = new String('a');
    obj.self = obj;
    let output = findCycles(obj);
    assert.equal(output.length, 0);
  });

  test('should not find cycle when cyclic object is a boolean', () => {
    let obj = new Boolean(true);
    obj.self = obj;
    let output = findCycles(obj);
    assert.equal(output.length, 0);
  });

  test('should find simple cycle', () => {
    let obj = {};
    obj.self = obj;
    let output = findCycles(obj);
    assert.equal(output.length, 1);
    assert.equal(output[0].length, 2);
    assert.sameMembers(joinAll(output[0]), joinAll([['$'], ['$', 'self']]));
  });

  test('should find more complicated cycle', () => {
    let obj = {selfContainer: {}};
    obj.selfContainer.self = obj;

    let output = findCycles(obj);

    assert.equal(output.length, 1);
    assert.equal(output[0].length, 2);
    assert.sameMembers(joinAll(output[0]), joinAll([['$'], ['$', 'selfContainer', 'self']]));
  });

  test('should find all the cycles', () => {
    let a = {};
    a.a = {};
    a.a.a = a;
    let b = {};
    b.b = {b: {}};
    b.b.b1 = b;
    b.b.b2 = {b: b};

    let c = {};
    c.c = c;
    let obj = {a, b, c};
    obj.self = obj;

    let output = findCycles(obj);

    assert.equal(output.length, 4);
    assert.sameMembers(output.map(joinAll).map((paths) => paths.toString()), [
      [['$', 'a'], ['$', 'a', 'a', 'a']],
      [['$', 'b'], ['$', 'b', 'b', 'b1'], ['$', 'b', 'b', 'b2', 'b']],
      [['$', 'c'], ['$', 'c', 'c']],
      [['$'], ['$', 'self']]
    ].map(joinAll).map((paths) => paths.toString()));
  });

  test('should find all cycles but only cycles', () => {
    let a = {};
    let b = {};
    let c = {};
    let d = {};
    let e = e;

    a.dep = b;
    b.dep = c;
    c.dep = a;
    d.dep = d;

    let obj = {a,b,c,d1: d,d2: d, e1: e, e2: e};
    obj.dep = obj;

    let output = findCycles(obj);

    assert.equal(output.length, 3);
    console.log()
    assert.sameMembers(output.map(joinAll).map((paths) => paths.toString()), [
      [['$', 'a'], ['$', 'a', 'dep', 'dep', 'dep']],
      [['$', 'd1'], ['$', 'd1', 'dep']],
      [['$'], ['$', 'dep']]
    ].map(joinAll).map((paths) => paths.toString()));
  });
});
