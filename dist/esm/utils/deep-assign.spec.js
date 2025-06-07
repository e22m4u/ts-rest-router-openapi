import { expect } from 'chai';
import { deepAssign } from './deep-assign.js';
describe('deepAssign', function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let target;
    beforeEach(function () {
        target = {};
    });
    it('should be a function', function () {
        expect(deepAssign).to.be.a('function');
    });
    it('should mutate the target object and return it', function () {
        const originalTarget = { a: 1 };
        const source = { b: 2 };
        const result = deepAssign(originalTarget, source);
        expect(originalTarget).to.have.property('b', 2);
        expect(result).to.equal(originalTarget);
        expect(result).to.deep.equal({ a: 1, b: 2 });
    });
    it('should assign new properties from a single source', function () {
        target = { a: 1 };
        const source = { b: 2, c: 3 };
        const result = deepAssign(target, source);
        expect(target).to.deep.equal({ a: 1, b: 2, c: 3 });
        expect(result).to.deep.equal({ a: 1, b: 2, c: 3 });
    });
    it('should overwrite existing properties from a single source', function () {
        target = { a: 1, b: 'old' };
        const source = { b: 'new', c: 3 };
        const result = deepAssign(target, source);
        expect(target).to.deep.equal({ a: 1, b: 'new', c: 3 });
        expect(result).to.deep.equal({ a: 1, b: 'new', c: 3 });
    });
    it('should deeply assign nested objects', function () {
        target = { a: 1, b: { c: 2, d: 'old_d' } };
        const source = { b: { d: 'new_d', e: 5 }, f: 6 };
        const result = deepAssign(target, source);
        expect(target).to.deep.equal({ a: 1, b: { c: 2, d: 'new_d', e: 5 }, f: 6 });
        expect(result).to.deep.equal({ a: 1, b: { c: 2, d: 'new_d', e: 5 }, f: 6 });
    });
    it('should handle multiple source objects, with later sources taking precedence', function () {
        target = { a: 1, b: { c: 10 } };
        const source1 = { b: { d: 20 }, e: 30 };
        const source2 = { a: 100, b: { c: 1000, e: 2000 }, f: 40 }; // e in source2 overwrites e from source1's effect on target
        const result = deepAssign(target, source1, source2);
        expect(target).to.deep.equal({
            a: 100,
            b: { c: 1000, d: 20, e: 2000 },
            e: 30,
            f: 40,
        });
        expect(result).to.deep.equal({
            a: 100,
            b: { c: 1000, d: 20, e: 2000 },
            e: 30,
            f: 40,
        });
    });
    describe('overwrite behavior (type mismatch for deep merge)', function () {
        it('should overwrite target object property with source primitive property', function () {
            target = { a: { nested: 'value' } };
            const source = { a: 'string' };
            deepAssign(target, source);
            expect(target).to.deep.equal({ a: 'string' });
        });
        it('should overwrite target primitive property with source object property', function () {
            target = { a: 'string' };
            const source = { a: { nested: 'value' } };
            deepAssign(target, source);
            expect(target).to.deep.equal({ a: { nested: 'value' } });
        });
        it('should overwrite target object property with source array property', function () {
            target = { a: { nested: 'value' } };
            const source = { a: [1, 2, 3] };
            deepAssign(target, source);
            expect(target).to.deep.equal({ a: [1, 2, 3] });
        });
        it('should overwrite target array property with source object property', function () {
            target = { a: [1, 2, 3] };
            const source = { a: { nested: 'value' } };
            deepAssign(target, source);
            expect(target).to.deep.equal({ a: { nested: 'value' } });
        });
        it('should overwrite target plain object property with a non-plain object (Date) from source', function () {
            target = { data: { timestamp: 123 } };
            const date = new Date();
            const source = { data: date };
            deepAssign(target, source);
            expect(target.data).to.be.instanceOf(Date);
            expect(target.data).to.equal(date);
        });
    });
    describe('handling of null and undefined property values from source', function () {
        it('should overwrite target property with null from source', function () {
            target = { a: 1, b: 'exists' };
            const source = { a: null };
            deepAssign(target, source);
            expect(target).to.deep.equal({ a: null, b: 'exists' });
        });
        it('should overwrite target property with undefined from source', function () {
            target = { a: 1, b: 'exists' };
            const source = { a: undefined, c: 3 };
            deepAssign(target, source);
            expect(target).to.have.property('a', undefined);
            expect(target).to.have.property('c', 3);
            expect(target.b).to.equal('exists');
            expect(Object.keys(target)).to.include('a');
        });
    });
    describe('behavior with empty or special sources', function () {
        it('should return target and not change it if no sources are provided', function () {
            target = { a: 1 };
            const original = JSON.parse(JSON.stringify(target));
            const result = deepAssign(target);
            expect(target).to.deep.equal(original);
            expect(result).to.equal(target);
        });
        it('should return target and not change it if an empty object source is provided', function () {
            target = { a: 1 };
            const original = JSON.parse(JSON.stringify(target));
            const result = deepAssign(target, {});
            expect(target).to.deep.equal(original);
            expect(result).to.equal(target);
        });
        it('should correctly process sources after an empty object source', function () {
            target = { a: 1 };
            const source1 = {};
            const source2 = { b: 2 };
            const result = deepAssign(target, source1, source2);
            expect(result).to.deep.equal({ a: 1, b: 2 });
        });
    });
    describe('error Handling', function () {
        it('should throw error if a source is a non-plain object (e.g., Date)', function () {
            target = { a: 1 };
            const nonPlainSource = new Date();
            expect(() => deepAssign(target, nonPlainSource)).to.throw('Arguments of deepAssign should be plain objects.');
        });
        it('should throw error if a source is an array (not a plain object)', function () {
            target = { a: 1 };
            const arraySource = [1, 2, 3];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(() => deepAssign(target, arraySource)).to.throw('Arguments of deepAssign should be plain objects.');
        });
        it('should throw error if target is a non-plain object (e.g., Date) and source is defined and plain', function () {
            target = new Date();
            const source = { a: 1 };
            expect(() => deepAssign(target, source)).to.throw('Arguments of deepAssign should be plain objects.');
        });
        it('should throw error if target is an array and source is defined and plain', function () {
            target = [1, 2, 3];
            const source = { a: 1 };
            expect(() => deepAssign(target, source)).to.throw('Arguments of deepAssign should be plain objects.');
        });
    });
    describe('miscellaneous', function () {
        it('should preserve target properties not present in any source', function () {
            target = { a: 1, b: 'preserved' };
            const source = { a: 100, c: 3 };
            deepAssign(target, source);
            expect(target).to.deep.equal({ a: 100, b: 'preserved', c: 3 });
        });
        it('should handle sources with no own properties (e.g., from Object.create(null)) correctly', function () {
            target = { a: 1 };
            const sourceWithNoProto = Object.create(null);
            sourceWithNoProto.b = 2;
            const sourceWithProto = { c: 3 };
            deepAssign(target, sourceWithNoProto, sourceWithProto);
            expect(target).to.deep.equal({ a: 1, b: 2, c: 3 });
        });
        it("should not copy properties from source's prototype chain", function () {
            target = { a: 1 };
            const myPrototype = { protoProp: 'fromProto' };
            const sourceWithProto = Object.create(myPrototype);
            sourceWithProto.ownProp = 'own';
            deepAssign(target, sourceWithProto);
            expect(target).to.deep.equal({ a: 1, ownProp: 'own' });
            expect(target).to.not.have.property('protoProp');
        });
    });
});
