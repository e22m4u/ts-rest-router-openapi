import {expect} from 'chai';
import {isPlainObject} from './is-plain-object.js';

describe('isPlainObject', function () {
  it('returns true for a plain object', function () {
    expect(isPlainObject({})).to.be.true;
    expect(isPlainObject({foo: 'bar'})).to.be.true;
    expect(isPlainObject(Object.create(null))).to.be.true;
  });

  it('returns false for not a plain object', function () {
    expect(isPlainObject('str')).to.be.false;
    expect(isPlainObject('')).to.be.false;
    expect(isPlainObject(10)).to.be.false;
    expect(isPlainObject(0)).to.be.false;
    expect(isPlainObject(true)).to.be.false;
    expect(isPlainObject(false)).to.be.false;
    expect(isPlainObject([1, 2, 3])).to.be.false;
    expect(isPlainObject([])).to.be.false;
    expect(isPlainObject(() => undefined)).to.be.false;
    expect(isPlainObject(new Date())).to.be.false;
  });
});
