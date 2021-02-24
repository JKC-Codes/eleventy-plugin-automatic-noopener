const test = require('ava');
const parser = require('../components/options-parser.js');


test('Accepts boolean noopener option', t => {
	t.true(parser({noopener: true}).noopener);
	t.false(parser({noopener: false}).noopener);
});


test('Rejects non-boolean noopener options', t => {
	t.throws(()=> {parser({noopener: 123})});
	t.throws(()=> {parser({noopener: 'foo'})});
	t.throws(()=> {parser({noopener: ['foo', 123]})});
	t.throws(()=> {parser({noopener: {foo: 'bar'}})});
	t.throws(()=> {parser({noopener: function(foo) {return 'bar';}})});
});


test('Ignores noopener option casing', t => {
	t.true(parser({noOpener: false}).hasOwnProperty('noopener'));
	t.false(parser({noOpener: false}).hasOwnProperty('noOpener'));

	t.true(parser({NOOPENER: false}).hasOwnProperty('noopener'));
	t.false(parser({NOOPENER: false}).hasOwnProperty('NOOPENER'));

	t.true(parser({NoOpener: false}).hasOwnProperty('noopener'));
	t.false(parser({NoOpener: false}).hasOwnProperty('NoOpener'));
});


test('Accepts boolean noReferrer option', t => {
	t.true(parser({noReferrer: true}).noreferrer);
	t.false(parser({noReferrer: false}).noreferrer);
});


test('Rejects non-boolean noreferrer options', t => {
	t.throws(()=> {parser({noReferrer: 123})});
	t.throws(()=> {parser({noReferrer: 'foo'})});
	t.throws(()=> {parser({noReferrer: ['foo', 123]})});
	t.throws(()=> {parser({noReferrer: {foo: 'bar'}})});
	t.throws(()=> {parser({noReferrer: function(foo) {return 'bar';}})});
});


test('Ignores noreferrer option casing', t => {
	t.true(parser({noReferrer: false}).hasOwnProperty('noreferrer'));
	t.false(parser({noReferrer: false}).hasOwnProperty('noReferrer'));

	t.true(parser({NOREFERRER: false}).hasOwnProperty('noreferrer'));
	t.false(parser({NOREFERRER: false}).hasOwnProperty('NOREFERRER'));

	t.true(parser({NoReferrer: false}).hasOwnProperty('noreferrer'));
	t.false(parser({NoReferrer: false}).hasOwnProperty('NoReferrer'));
});


test('Accepts regular expression ignore option', t => {
	t.true(parser({ignore: /regex/}).ignore instanceof RegExp);

	t.like(parser({ignore: /regex/}), {ignore: /regex/});
	t.like(parser({ignore: /regex/i}), {ignore: /regex/i});

	t.like(parser({ignore: new RegExp('regex')}), {ignore: /regex/});
	t.like(parser({ignore: new RegExp('regex', 'i')}), {ignore: /regex/i});
});


test('Rejects non regular expression ignore options', t => {
	t.throws(()=> {parser({ignore: true})});
	t.throws(()=> {parser({ignore: false})});
	t.throws(()=> {parser({ignore: 123})});
	t.throws(()=> {parser({ignore: 'foo'})});
	t.throws(()=> {parser({ignore: ['foo', 123]})});
	t.throws(()=> {parser({ignore: {foo: 'bar'}})});
	t.throws(()=> {parser({ignore: function(foo) {return 'bar';}})});
});


test('Ignores ignore option casing', t => {
	t.true(parser({Ignore: /regex/}).hasOwnProperty('ignore'));
	t.false(parser({Ignore: /regex/}).hasOwnProperty('Ignore'));

	t.true(parser({IGNORE: /regex/}).hasOwnProperty('ignore'));
	t.false(parser({IGNORE: /regex/}).hasOwnProperty('IGNORE'));

	t.true(parser({IgNoRe: /regex/}).hasOwnProperty('ignore'));
	t.false(parser({IgNoRe: /regex/}).hasOwnProperty('IgNoRe'));
});


test('Accepts valid array of elements options', t => {
	t.deepEqual(parser({elements: ['a']}).elements, ['a']);
	t.deepEqual(parser({elements: ['area']}).elements, ['area']);
	t.deepEqual(parser({elements: ['form']}).elements, ['form']);

	t.deepEqual(parser({elements: ['a', 'area']}).elements, ['a', 'area']);
	t.deepEqual(parser({elements: ['area', 'form']}).elements, ['area', 'form']);
	t.deepEqual(parser({elements: ['form', 'a']}).elements, ['form', 'a']);

	t.deepEqual(parser({elements: ['a', 'area', 'form']}).elements, ['a', 'area', 'form']);
	t.deepEqual(parser({elements: []}).elements, []);

	t.deepEqual(parser({elements: ['AREA']}).elements, ['area']);
	t.deepEqual(parser({elements: ['aReA']}).elements, ['area']);
	t.deepEqual(parser({elements: [' area	']}).elements, ['area']);
});


test('Rejects non array elements options', t => {
	t.throws(()=> {parser({elements: true})});
	t.throws(()=> {parser({elements: false})});
	t.throws(()=> {parser({elements: 123})});
	t.throws(()=> {parser({elements: 'foo'})});
	t.throws(()=> {parser({elements: {foo: 'bar'}})});
	t.throws(()=> {parser({elements: function(foo) {return 'bar';}})});
});


test('Rejects invalid elements options', t => {
	t.throws(()=> {parser({elements: [true]})});
	t.throws(()=> {parser({elements: [false]})});
	t.throws(()=> {parser({elements: [123]})});
	t.throws(()=> {parser({elements: ['foo']})});
	t.throws(()=> {parser({elements: [{bar: baz}]})});
	t.throws(()=> {parser({elements: ['a', 'area', 'foo', 'form']})});
	t.throws(()=> {parser({elements: ['areas']})});
	t.throws(()=> {parser({elements: ['forms']})});
});


test('Ignores elements option casing', t => {
	t.true(parser({Elements: ['a']}).hasOwnProperty('elements'));
	t.false(parser({Elements: ['a']}).hasOwnProperty('Elements'));

	t.true(parser({ELEMENTS: ['a']}).hasOwnProperty('elements'));
	t.false(parser({ELEMENTS: ['a']}).hasOwnProperty('ELEMENTS'));

	t.true(parser({ElEmEnTs: ['a']}).hasOwnProperty('elements'));
	t.false(parser({ElEmEnTs: ['a']}).hasOwnProperty('ElEmEnTs'));
});


test('Adds parsed key to options', t => {
	t.true(parser({noopener: true}).parsed);
	t.true(parser({noreferrer: true}).parsed);
	t.true(parser({ignore: /regex/}).parsed);
	t.true(parser({elements: ['a']}).parsed);
});


test('Ignores null or undefined options', t => {
	t.false(parser({noopener: null}).hasOwnProperty('noopener'));
	t.false(parser({noopener: undefined}).hasOwnProperty('noopener'));

	t.false(parser({noreferrer: null}).hasOwnProperty('noreferrer'));
	t.false(parser({noreferrer: undefined}).hasOwnProperty('noreferrer'));

	t.false(parser({ignore: null}).hasOwnProperty('ignore'));
	t.false(parser({ignore: undefined}).hasOwnProperty('ignore'));

	t.false(parser({elements: null}).hasOwnProperty('elements'));
	t.false(parser({elements: undefined}).hasOwnProperty('elements'));
});


test('Rejects invalid options', t => {
	t.throws(()=> {parser('foo')});
	t.throws(()=> {parser({bar: 'baz'})});
	t.throws(()=> {parser({nopener: true})});
	t.throws(()=> {parser({norefferer: true})});
	t.throws(()=> {parser({tags: ['a']})});
});