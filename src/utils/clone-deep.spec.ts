import {expect} from 'chai';
import {cloneDeep} from './clone-deep.js';

describe('cloneDeep', function () {
  it('returns a deep copy of a given object', function () {
    const value = {
      stringProp: 'string',
      numberProp: 10,
      booleanProp: true,
      arrayProp: [1, 2, 3],
      objectProp: {
        foo: 'string',
        bar: 'string',
      },
      nullProp: null,
    };
    const result = cloneDeep(value);
    expect(result).to.be.eql(value);
    expect(result).to.be.not.eq(value);
    expect(result.arrayProp).to.be.not.eq(value.arrayProp);
    expect(result.arrayProp).to.be.eql(value.arrayProp);
    expect(result.objectProp).to.be.not.eq(value.objectProp);
    expect(result.objectProp).to.be.eql(value.objectProp);
  });
});
