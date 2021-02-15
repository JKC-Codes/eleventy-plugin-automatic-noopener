const test = require('ava');
const PostHTML = require('posthtml');
const { posthtml: automaticNoopener } = require('../index.js');


function addAttributes(HTMLString, options) {
	options = Object.assign({
		noopener: false,
		noreferrer: false,
		ignore: null,
		elements: ['a', 'area', 'form']
	}, options);

	return PostHTML()
		.use(automaticNoopener(options))
		.process(HTMLString, { sync: true })
		.html;
}


test('Adds noopener to anchor links', t => {
	t.is(addAttributes(
		'<a href="http://google.com/"></a>', {noopener: true}),
		'<a href="http://google.com/" rel="noopener"></a>');

	t.is(addAttributes(
		'<a href="https://google.com/"></a>', {noopener: true}),
		'<a href="https://google.com/" rel="noopener"></a>');

	t.is(addAttributes(
		'<a href="https://google.com/" rel="nofollow"></a>', {noopener: true}),
		'<a href="https://google.com/" rel="nofollow noopener"></a>');

	t.is(addAttributes(
		'<a href="mailto:someone@gmail.com/"></a>', {noopener: true}),
		'<a href="mailto:someone@gmail.com/" rel="noopener"></a>');

	t.is(addAttributes(
		'<a href="ftp://username:password@google.com/ftp"></a>', {noopener: true}),
		'<a href="ftp://username:password@google.com/ftp" rel="noopener"></a>');
});


test('Adds noreferrer to anchor links', t => {
	t.is(addAttributes(
		'<a href="http://google.com/"></a>', {noreferrer: true}),
		'<a href="http://google.com/" rel="noreferrer"></a>');

	t.is(addAttributes(
		'<a href="https://google.com/"></a>', {noreferrer: true}),
		'<a href="https://google.com/" rel="noreferrer"></a>');

	t.is(addAttributes(
		'<a href="https://google.com/" rel="nofollow"></a>', {noreferrer: true}),
		'<a href="https://google.com/" rel="nofollow noreferrer"></a>');

	t.is(addAttributes(
		'<a href="mailto:someone@gmail.com/"></a>', {noreferrer: true}),
		'<a href="mailto:someone@gmail.com/" rel="noreferrer"></a>');

	t.is(addAttributes(
		'<a href="ftp://username:password@google.com/ftp"></a>', {noreferrer: true}),
		'<a href="ftp://username:password@google.com/ftp" rel="noreferrer"></a>');
});


test('Ignores relative anchor links', t => {
	t.is(addAttributes(
		'<a href="/foo"></a>', {noopener: true, noreferrer: true}),
		'<a href="/foo"></a>');

	t.is(addAttributes(
		'<a href="./foo"></a>', {noopener: true, noreferrer: true}),
		'<a href="./foo"></a>');

	t.is(addAttributes(
		'<a href="foo"></a>', {noopener: true, noreferrer: true}),
		'<a href="foo"></a>');

	t.is(addAttributes(
		'<a href="" rel=" foo "></a>', {noopener: true, noreferrer: true}),
		'<a href="" rel=" foo "></a>');
});


test('Adds noopener to area links', t => {
	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/"></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" rel="noopener"></map>');

		t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="https://google.com/"></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="https://google.com/" rel="noopener"></map>');

		t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="https://google.com/" rel="nofollow"></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="https://google.com/" rel="nofollow noopener"></map>');
});


test('Adds noreferrer to area links', t => {
	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/"></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" rel="noreferrer"></map>');

		t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="https://google.com/"></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="https://google.com/" rel="noreferrer"></map>');

		t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="https://google.com/" rel="nofollow"></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="https://google.com/" rel="nofollow noreferrer"></map>');
});


test('Ignores relative area links', t => {
	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="/foo"></map>', {noopener: true, noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="/foo"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="./foo"></map>', {noopener: true, noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="./foo"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="foo"></map>', {noopener: true, noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="foo"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="" rel=" foo "></map>', {noopener: true, noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="" rel=" foo "></map>');
});


test('Adds noopener to form links', t => {
	t.is(addAttributes(
		'<form action="http://google.com/"></form>', {noopener: true}),
		'<form action="http://google.com/" rel="noopener"></form>');

	t.is(addAttributes(
		'<form action="https://google.com/"></form>', {noopener: true}),
		'<form action="https://google.com/" rel="noopener"></form>');

	t.is(addAttributes(
		'<form action="https://google.com/" rel="nofollow"></form>', {noopener: true}),
		'<form action="https://google.com/" rel="nofollow noopener"></form>');

	t.is(addAttributes(
	'<form action=""><button formaction="http://google.com/"></button></form>', {noopener: true}),
	'<form action="" rel="noopener"><button formaction="http://google.com/"></button></form>');

	t.is(addAttributes(
	'<form action=""><input type="submit" formaction="http://google.com/"></form>', {noopener: true}),
	'<form action="" rel="noopener"><input type="submit" formaction="http://google.com/"></form>');

	t.is(addAttributes(
	'<form action=""><input type="image" formaction="http://google.com/"></form>', {noopener: true}),
	'<form action="" rel="noopener"><input type="image" formaction="http://google.com/"></form>');

	t.is(addAttributes(
		'<form action="" id="test"></form><button form="test" formaction="http://google.com/"></button>', {noopener: true}),
		'<form action="" id="test" rel="noopener"></form><button form="test" formaction="http://google.com/"></button>');
});


test('Adds nofollow to form links', t => {
	t.is(addAttributes(
		'<form action="http://google.com/"></form>', {noreferrer: true}),
		'<form action="http://google.com/" rel="noreferrer"></form>');

	t.is(addAttributes(
		'<form action="https://google.com/"></form>', {noreferrer: true}),
		'<form action="https://google.com/" rel="noreferrer"></form>');

	t.is(addAttributes(
		'<form action="https://google.com/" rel="nofollow"></form>', {noreferrer: true}),
		'<form action="https://google.com/" rel="nofollow noreferrer"></form>');

	t.is(addAttributes(
	'<form action=""><button formaction="http://google.com/"></button></form>', {noreferrer: true}),
	'<form action="" rel="noreferrer"><button formaction="http://google.com/"></button></form>');

	t.is(addAttributes(
	'<form action=""><input type="submit" formaction="http://google.com/"></form>', {noreferrer: true}),
	'<form action="" rel="noreferrer"><input type="submit" formaction="http://google.com/"></form>');

	t.is(addAttributes(
	'<form action=""><input type="image" formaction="http://google.com/"></form>', {noreferrer: true}),
	'<form action="" rel="noreferrer"><input type="image" formaction="http://google.com/"></form>');

	t.is(addAttributes(
		'<form action="" id="test"></form><button form="test" formaction="http://google.com/"></button>', {noreferrer: true}),
		'<form action="" id="test" rel="noreferrer"></form><button form="test" formaction="http://google.com/"></button>');
});


test('Ignores relative form links', t => {
	t.is(addAttributes(
		'<form action="/foo"></form>', {noopener: true, noreferrer: true}),
		'<form action="/foo"></form>');

	t.is(addAttributes(
		'<form action=""><button formaction="/foo"></button></form>', {noopener: true, noreferrer: true}),
		'<form action=""><button formaction="/foo"></button></form>');

	t.is(addAttributes(
		'<form action=""><input type="submit" formaction="/foo"></form>', {noopener: true, noreferrer: true}),
		'<form action=""><input type="submit" formaction="/foo"></form>');

	t.is(addAttributes(
		'<form action=""><input type="image" formaction="/foo"></form>', {noopener: true, noreferrer: true}),
		'<form action=""><input type="image" formaction="/foo"></form>');

	t.is(addAttributes(
		'<form action="" id="test"></form><button form="test" formaction="/foo"></button>', {noopener: true, noreferrer: true}),
		'<form action="" id="test"></form><button form="test" formaction="/foo"></button>');

	t.is(addAttributes(
		'<form action="./foo"></form>', {noopener: true, noreferrer: true}),
		'<form action="./foo"></form>');

	t.is(addAttributes(
	'<form action=""><button formaction="./foo"></button></form>', {noopener: true, noreferrer: true}),
	'<form action=""><button formaction="./foo"></button></form>');

	t.is(addAttributes(
	'<form action=""><input type="submit" formaction="./foo"></form>', {noopener: true, noreferrer: true}),
	'<form action=""><input type="submit" formaction="./foo"></form>');

	t.is(addAttributes(
	'<form action=""><input type="image" formaction="./foo"></form>', {noopener: true, noreferrer: true}),
	'<form action=""><input type="image" formaction="./foo"></form>');

	t.is(addAttributes(
		'<form action="" id="test"></form><button form="test" formaction="./foo"></button>', {noopener: true, noreferrer: true}),
		'<form action="" id="test"></form><button form="test" formaction="./foo"></button>');

	t.is(addAttributes(
		'<form action="foo"></form>', {noopener: true, noreferrer: true}),
		'<form action="foo"></form>');

	t.is(addAttributes(
	'<form action=""><button formaction="foo"></button></form>', {noopener: true, noreferrer: true}),
	'<form action=""><button formaction="foo"></button></form>');

	t.is(addAttributes(
	'<form action=""><input type="submit" formaction="foo"></form>', {noopener: true, noreferrer: true}),
	'<form action=""><input type="submit" formaction="foo"></form>');

	t.is(addAttributes(
	'<form action=""><input type="image" formaction="foo"></form>', {noopener: true, noreferrer: true}),
	'<form action=""><input type="image" formaction="foo"></form>');

	t.is(addAttributes(
		'<form action="" id="test"></form><button form="test" formaction="foo"></button>', {noopener: true, noreferrer: true}),
		'<form action="" id="test"></form><button form="test" formaction="foo"></button>');

	t.is(addAttributes(
		'<form action="" rel=" foo "></form>', {noopener: true, noreferrer: true}),
		'<form action="" rel=" foo "></form>');
});


test('Noreferrer overrides noopener', t => {
	t.is(addAttributes(
		'<a href="http://google.com/"></a>', {noopener: true, noreferrer: true}),
		'<a href="http://google.com/" rel="noreferrer"></a>');

		t.is(addAttributes(
		'<a href="http://google.com/" rel="noreferrer"></a>', {noopener: true, noreferrer: true}),
		'<a href="http://google.com/" rel="noreferrer"></a>');
});


test('URLs can be ignored', t => {
	t.is(addAttributes(
		'<a href="http://google.com/"></a>', {noopener: true, ignore: /google/}),
		'<a href="http://google.com/"></a>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/"></map>', {noopener: true, ignore: /google/}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/"></map>');

	t.is(addAttributes(
		'<form action="http://google.com/"></form>', {noopener: true, ignore: /google/}),
		'<form action="http://google.com/"></form>');

	t.is(addAttributes(
		'<a href="http://gOoGlE.com/"></a>', {noopener: true, ignore: /google/i}),
		'<a href="http://gOoGlE.com/"></a>');
});


test('elements can be toggled', t => {
	t.is(addAttributes(
		'<a href="http://google.com/"></a>', {noopener: true, elements: []}),
		'<a href="http://google.com/"></a>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/"></map>', {noopener: true, elements: []}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/"></map>');

	t.is(addAttributes(
		'<form action="http://google.com/"></form>', {noopener: true, elements: []}),
		'<form action="http://google.com/"></form>');

	t.is(addAttributes(
		'<a href="http://google.com/"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/"></map><form action="http://google.com/"></form>', {noopener: true, elements: ['a']}),
		'<a href="http://google.com/" rel="noopener"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/"></map><form action="http://google.com/"></form>');

	t.is(addAttributes(
		'<a href="http://google.com/"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/"></map><form action="http://google.com/"></form>', {noopener: true, elements: ['area']}),
		'<a href="http://google.com/"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/" rel="noopener"></map><form action="http://google.com/"></form>');

	t.is(addAttributes(
		'<a href="http://google.com/"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/"></map><form action="http://google.com/"></form>', {noopener: true, elements: ['form']}),
		'<a href="http://google.com/"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/"></map><form action="http://google.com/" rel="noopener"></form>');

	t.is(addAttributes(
		'<a href="http://google.com/"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/"></map><form action="http://google.com/"></form>', {noopener: true, elements: ['a', 'area']}),
		'<a href="http://google.com/" rel="noopener"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/" rel="noopener"></map><form action="http://google.com/"></form>');

	t.is(addAttributes(
		'<a href="http://google.com/"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/"></map><form action="http://google.com/"></form>', {noopener: true, elements: ['area', 'form']}),
		'<a href="http://google.com/"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/" rel="noopener"></map><form action="http://google.com/" rel="noopener"></form>');

	t.is(addAttributes(
		'<a href="http://google.com/"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/"></map><form action="http://google.com/"></form>', {noopener: true, elements: ['a', 'form']}),
		'<a href="http://google.com/" rel="noopener"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/"></map><form action="http://google.com/" rel="noopener"></form>');
});