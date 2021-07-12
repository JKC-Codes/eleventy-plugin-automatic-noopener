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
		'<a href="http://google.com/" target="_blank"></a>', {noopener: true}),
		'<a href="http://google.com/" target="_blank" rel="noopener"></a>');

	t.is(addAttributes(
		'<A hReF="http://google.com/" target="_blank"></A>', {noopener: true}),
		'<A hReF="http://google.com/" target="_blank" rel="noopener"></A>');

	t.is(addAttributes(
		'<a href="https://google.com/" target="_blank"></a>', {noopener: true}),
		'<a href="https://google.com/" target="_blank" rel="noopener"></a>');

	t.is(addAttributes(
		'<a href="//google.com/" target="_blank"></a>', {noopener: true}),
		'<a href="//google.com/" target="_blank" rel="noopener"></a>');

	t.is(addAttributes(
		'<a href="https://google.com/" target="_blank" rel="nofollow"></a>', {noopener: true}),
		'<a href="https://google.com/" target="_blank" rel="nofollow noopener"></a>');

	t.is(addAttributes(
		'<a href="mailto:someone@gmail.com/" target="_blank"></a>', {noopener: true}),
		'<a href="mailto:someone@gmail.com/" target="_blank" rel="noopener"></a>');

	t.is(addAttributes(
		'<a href="ftp://username:password@google.com/ftp" target="_blank"></a>', {noopener: true}),
		'<a href="ftp://username:password@google.com/ftp" target="_blank" rel="noopener"></a>');
});


test('Adds noreferrer to anchor links', t => {
	t.is(addAttributes(
		'<a href="http://google.com/" target="_blank"></a>', {noreferrer: true}),
		'<a href="http://google.com/" target="_blank" rel="noreferrer"></a>');

	t.is(addAttributes(
		'<a href="https://google.com/" target="_blank"></a>', {noreferrer: true}),
		'<a href="https://google.com/" target="_blank" rel="noreferrer"></a>');

	t.is(addAttributes(
		'<a href="//google.com/" target="_blank"></a>', {noreferrer: true}),
		'<a href="//google.com/" target="_blank" rel="noreferrer"></a>');

	t.is(addAttributes(
		'<a href="https://google.com/" target="_blank" rel="nofollow"></a>', {noreferrer: true}),
		'<a href="https://google.com/" target="_blank" rel="nofollow noreferrer"></a>');

	t.is(addAttributes(
		'<a href="mailto:someone@gmail.com/" target="_blank"></a>', {noreferrer: true}),
		'<a href="mailto:someone@gmail.com/" target="_blank" rel="noreferrer"></a>');

	t.is(addAttributes(
		'<a href="ftp://username:password@google.com/ftp" target="_blank"></a>', {noreferrer: true}),
		'<a href="ftp://username:password@google.com/ftp" target="_blank" rel="noreferrer"></a>');
});


test('Noopener ignores relative anchor links', t => {
	t.is(addAttributes(
		'<a href="/foo"></a>', {noopener: true}),
		'<a href="/foo"></a>');

	t.is(addAttributes(
		'<a href="./foo"></a>', {noopener: true}),
		'<a href="./foo"></a>');

	t.is(addAttributes(
		'<a href="foo"></a>', {noopener: true}),
		'<a href="foo"></a>');

	t.is(addAttributes(
		'<a href="" rel=" foo "></a>', {noopener: true}),
		'<a href="" rel=" foo "></a>');
});


test('Noreferrer ignores relative anchor links', t => {
	t.is(addAttributes(
		'<a href="/foo"></a>', {noreferrer: true}),
		'<a href="/foo"></a>');

	t.is(addAttributes(
		'<a href="./foo"></a>', {noreferrer: true}),
		'<a href="./foo"></a>');

	t.is(addAttributes(
		'<a href="foo"></a>', {noreferrer: true}),
		'<a href="foo"></a>');

	t.is(addAttributes(
		'<a href="" rel=" foo "></a>', {noreferrer: true}),
		'<a href="" rel=" foo "></a>');
});


test('Noopener ignores non-"_blank" anchor targets', t => {
	t.is(addAttributes(
		'<a href="http://google.com/" target="_parent"></a>', {noopener: true}),
		'<a href="http://google.com/" target="_parent"></a>');

	t.is(addAttributes(
		'<a href="http://google.com/" target="_self"></a>', {noopener: true}),
		'<a href="http://google.com/" target="_self"></a>');

	t.is(addAttributes(
		'<a href="http://google.com/" target="_top"></a>', {noopener: true}),
		'<a href="http://google.com/" target="_top"></a>');

	t.is(addAttributes(
		'<a href="http://google.com/" target=""></a>', {noopener: true}),
		'<a href="http://google.com/" target=""></a>');

	t.is(addAttributes(
		'<a href="http://google.com/" target="named"></a>', {noopener: true}),
		'<a href="http://google.com/" target="named" rel="noopener"></a>');

	t.is(addAttributes(
		'<a href="http://google.com/" target=" "></a>', {noopener: true}),
		'<a href="http://google.com/" target=" " rel="noopener"></a>');
});


test('Noreferrer includes non-"_blank" anchor targets', t => {
	t.is(addAttributes(
		'<a href="http://google.com/" target="_parent"></a>', {noreferrer: true}),
		'<a href="http://google.com/" target="_parent" rel="noreferrer"></a>');

	t.is(addAttributes(
		'<a href="http://google.com/" target="_self"></a>', {noreferrer: true}),
		'<a href="http://google.com/" target="_self" rel="noreferrer"></a>');

	t.is(addAttributes(
		'<a href="http://google.com/" target="_top"></a>', {noreferrer: true}),
		'<a href="http://google.com/" target="_top" rel="noreferrer"></a>');

	t.is(addAttributes(
		'<a href="http://google.com/" target=""></a>', {noreferrer: true}),
		'<a href="http://google.com/" target="" rel="noreferrer"></a>');

	t.is(addAttributes(
		'<a href="http://google.com/" target="named"></a>', {noreferrer: true}),
		'<a href="http://google.com/" target="named" rel="noreferrer"></a>');

	t.is(addAttributes(
		'<a href="http://google.com/" target=" "></a>', {noreferrer: true}),
		'<a href="http://google.com/" target=" " rel="noreferrer"></a>');
});


test('Adds noopener to area links', t => {
	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank"></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank" rel="noopener"></map>');

	t.is(addAttributes(
		'<map><aReA shape="rect" coords="0,0,0,0" hReF="http://google.com/" target="_blank"></map>', {noopener: true}),
		'<map><aReA shape="rect" coords="0,0,0,0" hReF="http://google.com/" target="_blank" rel="noopener"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="https://google.com/" target="_blank"></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="https://google.com/" target="_blank" rel="noopener"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="//google.com/" target="_blank"></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="//google.com/" target="_blank" rel="noopener"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="https://google.com/" target="_blank" rel="nofollow"></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="https://google.com/" target="_blank" rel="nofollow noopener"></map>');
});


test('Adds noreferrer to area links', t => {
	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank"></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank" rel="noreferrer"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="https://google.com/" target="_blank"></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="https://google.com/" target="_blank" rel="noreferrer"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="//google.com/" target="_blank"></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="//google.com/" target="_blank" rel="noreferrer"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="https://google.com/" target="_blank" rel="nofollow"></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="https://google.com/" target="_blank" rel="nofollow noreferrer"></map>');
});


test('Noopener ignores relative area links', t => {
	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="/foo" target="_blank"></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="/foo" target="_blank"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="./foo" target="_blank"></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="./foo" target="_blank"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="foo" target="_blank"></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="foo" target="_blank"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="" rel=" foo " target="_blank"></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="" rel=" foo " target="_blank"></map>');
});


test('Noreferrer ignores relative area links', t => {
	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="/foo" target="_blank"></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="/foo" target="_blank"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="./foo" target="_blank"></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="./foo" target="_blank"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="foo" target="_blank"></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="foo" target="_blank"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="" rel=" foo " target="_blank"></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="" rel=" foo " target="_blank"></map>');
});


test('Noopener ignores non-"_blank" area links', t => {
	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_parent"></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_parent"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_self"></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_self"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_top"></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_top"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target=""></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target=""></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="named"></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="named" rel="noopener"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target=" "></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target=" " rel="noopener"></map>');
});


test('Noreferrer includes non-"_blank" area links', t => {
	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_parent"></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_parent" rel="noreferrer"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_self"></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_self" rel="noreferrer"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_top"></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_top" rel="noreferrer"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target=""></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="" rel="noreferrer"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="named"></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="named" rel="noreferrer"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target=" "></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target=" " rel="noreferrer"></map>');
});


test('Adds noopener to form links', t => {
	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank"></form>', {noopener: true}),
		'<form action="http://google.com/" target="_blank" rel="noopener"></form>');

	t.is(addAttributes(
		'<fOrM aCtIoN="http://google.com/" target="_blank"></fOrM>', {noopener: true}),
		'<fOrM aCtIoN="http://google.com/" target="_blank" rel="noopener"></fOrM>');

	t.is(addAttributes(
		'<form action="https://google.com/" target="_blank"></form>', {noopener: true}),
		'<form action="https://google.com/" target="_blank" rel="noopener"></form>');

	t.is(addAttributes(
		'<form action="//google.com/" target="_blank"></form>', {noopener: true}),
		'<form action="//google.com/" target="_blank" rel="noopener"></form>');

	t.is(addAttributes(
		'<form action="https://google.com/" target="_blank" rel="nofollow"></form>', {noopener: true}),
		'<form action="https://google.com/" target="_blank" rel="nofollow noopener"></form>');
});


test('Adds noreferrer to form links', t => {
	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank"></form>', {noreferrer: true}),
		'<form action="http://google.com/" target="_blank" rel="noreferrer"></form>');

	t.is(addAttributes(
		'<form action="https://google.com/" target="_blank"></form>', {noreferrer: true}),
		'<form action="https://google.com/" target="_blank" rel="noreferrer"></form>');

	t.is(addAttributes(
		'<form action="//google.com/" target="_blank"></form>', {noreferrer: true}),
		'<form action="//google.com/" target="_blank" rel="noreferrer"></form>');

	t.is(addAttributes(
		'<form action="https://google.com/" target="_blank" rel="nofollow"></form>', {noreferrer: true}),
		'<form action="https://google.com/" target="_blank" rel="nofollow noreferrer"></form>');
});


test('Noopener ignores relative form links', t => {
	t.is(addAttributes(
		'<form action="/foo" target="_blank"></form>', {noopener: true}),
		'<form action="/foo" target="_blank"></form>');

	t.is(addAttributes(
		'<form action="./foo" target="_blank"></form>', {noopener: true}),
		'<form action="./foo" target="_blank"></form>');

	t.is(addAttributes(
		'<form action="foo" target="_blank"></form>', {noopener: true}),
		'<form action="foo" target="_blank"></form>');

	t.is(addAttributes(
		'<form action="" target="_blank" rel=" foo "></form>', {noopener: true}),
		'<form action="" target="_blank" rel=" foo "></form>');
});


test('Noreferrer ignores relative form links', t => {
	t.is(addAttributes(
		'<form action="/foo" target="_blank"></form>', {noreferrer: true}),
		'<form action="/foo" target="_blank"></form>');

	t.is(addAttributes(
		'<form action="./foo" target="_blank"></form>', {noreferrer: true}),
		'<form action="./foo" target="_blank"></form>');

	t.is(addAttributes(
		'<form action="foo" target="_blank"></form>', {noreferrer: true}),
		'<form action="foo" target="_blank"></form>');

	t.is(addAttributes(
		'<form action="" target="_blank" rel=" foo "></form>', {noreferrer: true}),
		'<form action="" target="_blank" rel=" foo "></form>');
});


test('Noopener ignores non-"_blank" form links', t => {
	t.is(addAttributes(
		'<form action="http://google.com/" target="_parent"></form>', {noopener: true}),
		'<form action="http://google.com/" target="_parent"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target="_self"></form>', {noopener: true}),
		'<form action="http://google.com/" target="_self"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target="_top"></form>', {noopener: true}),
		'<form action="http://google.com/" target="_top"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target=""></form>', {noopener: true}),
		'<form action="http://google.com/" target=""></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target="named"></form>', {noopener: true}),
		'<form action="http://google.com/" target="named" rel="noopener"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target=" "></form>', {noopener: true}),
		'<form action="http://google.com/" target=" " rel="noopener"></form>');
});


test('Noreferrer includes non-"_blank" form links', t => {
	t.is(addAttributes(
		'<form action="http://google.com/" target="_parent"></form>', {noreferrer: true}),
		'<form action="http://google.com/" target="_parent" rel="noreferrer"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target="_self"></form>', {noreferrer: true}),
		'<form action="http://google.com/" target="_self" rel="noreferrer"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target="_top"></form>', {noreferrer: true}),
		'<form action="http://google.com/" target="_top" rel="noreferrer"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target=""></form>', {noreferrer: true}),
		'<form action="http://google.com/" target="" rel="noreferrer"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target="named"></form>', {noreferrer: true}),
		'<form action="http://google.com/" target="named" rel="noreferrer"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target=" "></form>', {noreferrer: true}),
		'<form action="http://google.com/" target=" " rel="noreferrer"></form>');
});


test('Formaction overrides action', t => {
	t.is(addAttributes(
		'<form action="/foo" target="_blank"><button formaction="http://google.com/"></button></form>', {noopener: true}),
		'<form action="/foo" target="_blank" rel="noopener"><button formaction="http://google.com/"></button></form>');

	t.is(addAttributes(
	'<form action="/foo" target="_blank"><input type="submit" formaction="http://google.com/"></form>', {noopener: true}),
	'<form action="/foo" target="_blank" rel="noopener"><input type="submit" formaction="http://google.com/"></form>');

	t.is(addAttributes(
	'<form action="/foo" target="_blank"><input type="image" formaction="http://google.com/"></form>', {noopener: true}),
	'<form action="/foo" target="_blank" rel="noopener"><input type="image" formaction="http://google.com/"></form>');

	t.is(addAttributes(
		'<form action="/foo" target="_blank" id="test"></form><button form="test" formaction="http://google.com/"></button>', {noopener: true}),
		'<form action="/foo" target="_blank" id="test" rel="noopener"></form><button form="test" formaction="http://google.com/"></button>');


	t.is(addAttributes(
		'<form action="/foo" target="_blank"><button formaction="http://google.com/"></button></form>', {noreferrer: true}),
		'<form action="/foo" target="_blank" rel="noreferrer"><button formaction="http://google.com/"></button></form>');

	t.is(addAttributes(
	'<form action="/foo" target="_blank"><input type="submit" formaction="http://google.com/"></form>', {noreferrer: true}),
	'<form action="/foo" target="_blank" rel="noreferrer"><input type="submit" formaction="http://google.com/"></form>');

	t.is(addAttributes(
	'<form action="/foo" target="_blank"><input type="image" formaction="http://google.com/"></form>', {noreferrer: true}),
	'<form action="/foo" target="_blank" rel="noreferrer"><input type="image" formaction="http://google.com/"></form>');

	t.is(addAttributes(
		'<form action="/foo" target="_blank" id="test"></form><button form="test" formaction="http://google.com/"></button>', {noreferrer: true}),
		'<form action="/foo" target="_blank" id="test" rel="noreferrer"></form><button form="test" formaction="http://google.com/"></button>');


	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank"><button formaction="/foo"></button></form>', {noopener: true}),
		'<form action="http://google.com/" target="_blank" rel="noopener"><button formaction="/foo"></button></form>');

	t.is(addAttributes(
	'<form action="http://google.com/" target="_blank"><input type="submit" formaction="/foo"></form>', {noopener: true}),
	'<form action="http://google.com/" target="_blank" rel="noopener"><input type="submit" formaction="/foo"></form>');

	t.is(addAttributes(
	'<form action="http://google.com/" target="_blank"><input type="image" formaction="/foo"></form>', {noopener: true}),
	'<form action="http://google.com/" target="_blank" rel="noopener"><input type="image" formaction="/foo"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank" id="test"></form><button form="test" formaction="/foo"></button>', {noopener: true}),
		'<form action="http://google.com/" target="_blank" id="test" rel="noopener"></form><button form="test" formaction="/foo"></button>');


	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank"><button formaction="/foo"></button></form>', {noreferrer: true}),
		'<form action="http://google.com/" target="_blank" rel="noreferrer"><button formaction="/foo"></button></form>');

	t.is(addAttributes(
	'<form action="http://google.com/" target="_blank"><input type="submit" formaction="/foo"></form>', {noreferrer: true}),
	'<form action="http://google.com/" target="_blank" rel="noreferrer"><input type="submit" formaction="/foo"></form>');

	t.is(addAttributes(
	'<form action="http://google.com/" target="_blank"><input type="image" formaction="/foo"></form>', {noreferrer: true}),
	'<form action="http://google.com/" target="_blank" rel="noreferrer"><input type="image" formaction="/foo"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank" id="test"></form><button form="test" formaction="/foo"></button>', {noreferrer: true}),
		'<form action="http://google.com/" target="_blank" id="test" rel="noreferrer"></form><button form="test" formaction="/foo"></button>');
});


test('Formtarget overrides target', t => {
	t.is(addAttributes(
		'<form action="http://google.com/"><button formtarget="_blank"></button></form>', {noopener: true}),
		'<form action="http://google.com/" rel="noopener"><button formtarget="_blank"></button></form>');

	t.is(addAttributes(
	'<form action="http://google.com/"><input type="submit" formtarget="_blank"></form>', {noopener: true}),
	'<form action="http://google.com/" rel="noopener"><input type="submit" formtarget="_blank"></form>');

	t.is(addAttributes(
	'<form action="http://google.com/"><input type="image" formtarget="_blank"></form>', {noopener: true}),
	'<form action="http://google.com/" rel="noopener"><input type="image" formtarget="_blank"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" id="test"></form><button form="test" formtarget="_blank"></button>', {noopener: true}),
		'<form action="http://google.com/" id="test" rel="noopener"></form><button form="test" formtarget="_blank"></button>');


	t.is(addAttributes(
		'<form action="http://google.com/"><button formtarget="_blank"></button></form>', {noreferrer: true}),
		'<form action="http://google.com/" rel="noreferrer"><button formtarget="_blank"></button></form>');

	t.is(addAttributes(
	'<form action="http://google.com/"><input type="submit" formtarget="_blank"></form>', {noreferrer: true}),
	'<form action="http://google.com/" rel="noreferrer"><input type="submit" formtarget="_blank"></form>');

	t.is(addAttributes(
	'<form action="http://google.com/"><input type="image" formtarget="_blank"></form>', {noreferrer: true}),
	'<form action="http://google.com/" rel="noreferrer"><input type="image" formtarget="_blank"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" id="test"></form><button form="test" formtarget="_blank"></button>', {noreferrer: true}),
		'<form action="http://google.com/" id="test" rel="noreferrer"></form><button form="test" formtarget="_blank"></button>');


	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank"><button formtarget="_self"></button></form>', {noopener: true}),
		'<form action="http://google.com/" target="_blank" rel="noopener"><button formtarget="_self"></button></form>');

	t.is(addAttributes(
	'<form action="http://google.com/" target="_blank"><input type="submit" formtarget="_self"></form>', {noopener: true}),
	'<form action="http://google.com/" target="_blank" rel="noopener"><input type="submit" formtarget="_self"></form>');

	t.is(addAttributes(
	'<form action="http://google.com/" target="_blank"><input type="image" formtarget="_self"></form>', {noopener: true}),
	'<form action="http://google.com/" target="_blank" rel="noopener"><input type="image" formtarget="_self"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank" id="test"></form><button form="test" formtarget="_self"></button>', {noopener: true}),
		'<form action="http://google.com/" target="_blank" id="test" rel="noopener"></form><button form="test" formtarget="_self"></button>');


	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank"><button formtarget="_self"></button></form>', {noreferrer: true}),
		'<form action="http://google.com/" target="_blank" rel="noreferrer"><button formtarget="_self"></button></form>');

	t.is(addAttributes(
	'<form action="http://google.com/" target="_blank"><input type="submit" formtarget="_self"></form>', {noreferrer: true}),
	'<form action="http://google.com/" target="_blank" rel="noreferrer"><input type="submit" formtarget="_self"></form>');

	t.is(addAttributes(
	'<form action="http://google.com/" target="_blank"><input type="image" formtarget="_self"></form>', {noreferrer: true}),
	'<form action="http://google.com/" target="_blank" rel="noreferrer"><input type="image" formtarget="_self"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank" id="test"></form><button form="test" formtarget="_self"></button>', {noreferrer: true}),
		'<form action="http://google.com/" target="_blank" id="test" rel="noreferrer"></form><button form="test" formtarget="_self"></button>');
});


test('Only submit buttons override attributes', t => {
	t.is(addAttributes(
		'<form action="http://google.com/"><button formtarget="_blank" type="submit"></button></form>', {noopener: true}),
		'<form action="http://google.com/" rel="noopener"><button formtarget="_blank" type="submit"></button></form>');

	t.is(addAttributes(
		'<form action="http://google.com/"><button formtarget="_blank" type="button"></button></form>', {noopener: true}),
		'<form action="http://google.com/"><button formtarget="_blank" type="button"></button></form>');

	t.is(addAttributes(
		'<form action="http://google.com/"><button formtarget="_blank" type="reset"></button></form>', {noopener: true}),
		'<form action="http://google.com/"><button formtarget="_blank" type="reset"></button></form>');

	t.is(addAttributes(
		'<form action="http://google.com/"><button formtarget="_blank" type="invalid"></button></form>', {noopener: true}),
		'<form action="http://google.com/" rel="noopener"><button formtarget="_blank" type="invalid"></button></form>');

	t.is(addAttributes(
		'<form action="http://google.com/"><button formtarget="_blank" type=""></button></form>', {noopener: true}),
		'<form action="http://google.com/" rel="noopener"><button formtarget="_blank" type=""></button></form>');
});


test('Noreferrer overrides noopener', t => {
	t.is(addAttributes(
		'<a href="http://google.com/" target="_blank"></a>', {noopener: true, noreferrer: true}),
		'<a href="http://google.com/" target="_blank" rel="noreferrer"></a>');

		t.is(addAttributes(
		'<a href="http://google.com/" target="_blank" rel="noopener"></a>', {noopener: true, noreferrer: true}),
		'<a href="http://google.com/" target="_blank" rel="noopener noreferrer"></a>');

		t.is(addAttributes(
		'<a href="http://google.com/" target="_blank" rel="noreferrer"></a>', {noopener: true, noreferrer: true}),
		'<a href="http://google.com/" target="_blank" rel="noreferrer"></a>');
});


test('Opener prevents noopener and noreferrer', t => {
	t.is(addAttributes(
		'<a href="http://google.com/" target="_blank" rel="opener"></a>', {noopener: true}),
		'<a href="http://google.com/" target="_blank" rel="opener"></a>');

	t.is(addAttributes(
		'<a href="http://google.com/" target="_blank" rel="opener"></a>', {noreferrer: true}),
		'<a href="http://google.com/" target="_blank" rel="opener"></a>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank" rel="opener"></map>', {noopener: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank" rel="opener"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank" rel="opener"></map>', {noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank" rel="opener"></map>');

	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank" rel="opener"></form>', {noopener: true}),
		'<form action="http://google.com/" target="_blank" rel="opener"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank" rel="opener"></form>', {noreferrer: true}),
		'<form action="http://google.com/" target="_blank" rel="opener"></form>');
});


test('Classes are not duplicated', t => {
	t.is(addAttributes(
		'<a href="http://google.com/" target="_blank" rel="noopener"></a>', {noopener: true, noreferrer: false}),
		'<a href="http://google.com/" target="_blank" rel="noopener"></a>');

	t.is(addAttributes(
		'<a href="http://google.com/" target="_blank" rel="noreferrer"></a>', {noopener: false, noreferrer: true}),
		'<a href="http://google.com/" target="_blank" rel="noreferrer"></a>');

	t.is(addAttributes(
		'<a href="http://google.com/" target="_blank" rel="noopener noreferrer"></a>', {noopener: true, noreferrer: true}),
		'<a href="http://google.com/" target="_blank" rel="noopener noreferrer"></a>');


	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank" rel="noopener"></map>', {noopener: true, noreferrer: false}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank" rel="noopener"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank" rel="noreferrer"></map>', {noopener: false, noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank" rel="noreferrer"></map>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank" rel="noopener noreferrer"></map>', {noopener: true, noreferrer: true}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank" rel="noopener noreferrer"></map>');


	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank" rel="noopener"></form>', {noopener: true, noreferrer: false}),
		'<form action="http://google.com/" target="_blank" rel="noopener"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank" rel="noreferrer"></form>', {noopener: false, noreferrer: true}),
		'<form action="http://google.com/" target="_blank" rel="noreferrer"></form>');

	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank" rel="noopener noreferrer"></form>', {noopener: true, noreferrer: true}),
		'<form action="http://google.com/" target="_blank" rel="noopener noreferrer"></form>');
});


test('URLs can be ignored', t => {
	t.is(addAttributes(
		'<a href="http://google.com/" target="_blank"></a>', {noopener: true, ignore: /google/}),
		'<a href="http://google.com/" target="_blank"></a>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank"></map>', {noopener: true, ignore: /google/}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank"></map>');

	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank"></form>', {noopener: true, ignore: /google/}),
		'<form action="http://google.com/" target="_blank"></form>');

	t.is(addAttributes(
		'<a href="http://gOoGlE.com/" target="_blank"></a>', {noopener: true, ignore: /google/i}),
		'<a href="http://gOoGlE.com/" target="_blank"></a>');


	t.is(addAttributes(
		'<a href="http://bing.com/" target="_blank"></a>', {noreferrer: true, ignore: /bing/}),
		'<a href="http://bing.com/" target="_blank"></a>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://bing.com/" target="_blank"></map>', {noreferrer: true, ignore: /bing/}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://bing.com/" target="_blank"></map>');

	t.is(addAttributes(
		'<form action="http://bing.com/" target="_blank"></form>', {noreferrer: true, ignore: /bing/}),
		'<form action="http://bing.com/" target="_blank"></form>');

	t.is(addAttributes(
		'<a href="http://BiNg.com/" target="_blank"></a>', {noreferrer: true, ignore: /bing/i}),
		'<a href="http://BiNg.com/" target="_blank"></a>');
});


test('elements can be toggled', t => {
	t.is(addAttributes(
		'<a href="http://google.com/" target="_blank"></a>', {noopener: true, elements: []}),
		'<a href="http://google.com/" target="_blank"></a>');

	t.is(addAttributes(
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank"></map>', {noopener: true, elements: []}),
		'<map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank"></map>');

	t.is(addAttributes(
		'<form action="http://google.com/" target="_blank"></form>', {noopener: true, elements: []}),
		'<form action="http://google.com/" target="_blank"></form>');

	t.is(addAttributes(
		'<a href="http://google.com/" target="_blank"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank"></map><form action="http://google.com/" target="_blank"></form>', {noopener: true, elements: ['a']}),
		'<a href="http://google.com/" target="_blank" rel="noopener"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank"></map><form action="http://google.com/" target="_blank"></form>');

	t.is(addAttributes(
		'<a href="http://google.com/" target="_blank"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank"></map><form action="http://google.com/" target="_blank"></form>', {noopener: true, elements: ['area']}),
		'<a href="http://google.com/" target="_blank"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank" rel="noopener"></map><form action="http://google.com/" target="_blank"></form>');

	t.is(addAttributes(
		'<a href="http://google.com/" target="_blank"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank"></map><form action="http://google.com/" target="_blank"></form>', {noopener: true, elements: ['form']}),
		'<a href="http://google.com/" target="_blank"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank"></map><form action="http://google.com/" target="_blank" rel="noopener"></form>');

	t.is(addAttributes(
		'<a href="http://google.com/" target="_blank"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank"></map><form action="http://google.com/" target="_blank"></form>', {noopener: true, elements: ['a', 'area']}),
		'<a href="http://google.com/" target="_blank" rel="noopener"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank" rel="noopener"></map><form action="http://google.com/" target="_blank"></form>');

	t.is(addAttributes(
		'<a href="http://google.com/" target="_blank"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank"></map><form action="http://google.com/" target="_blank"></form>', {noopener: true, elements: ['area', 'form']}),
		'<a href="http://google.com/" target="_blank"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank" rel="noopener"></map><form action="http://google.com/" target="_blank" rel="noopener"></form>');

	t.is(addAttributes(
		'<a href="http://google.com/" target="_blank"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank"></map><form action="http://google.com/" target="_blank"></form>', {noopener: true, elements: ['a', 'form']}),
		'<a href="http://google.com/" target="_blank" rel="noopener"></a><map><area shape="rect" coords="0,0,0,0" href="http://google.com/" target="_blank"></map><form action="http://google.com/" target="_blank" rel="noopener"></form>');
});