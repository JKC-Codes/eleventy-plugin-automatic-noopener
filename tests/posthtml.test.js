const test = require('ava');
const PostHTML = require('posthtml');
const { posthtml, parser } = require('../index.js');

const defaultOptions = {
	noopener: true,
	noreferrer: false,
	ignore: null,
	elements: ['a', 'area', 'form']
};


function addAttributes(HTMLString, options) {
	return PostHTML([posthtml(options)])
		.process(HTMLString)
		.then(result => result.html);
}


test('Can be used directly with PostHTML', async t => {
	return addAttributes('<a href="https://bing.com/">test</a>')
	.then(result => {
		t.is(result, '<a href="https://bing.com/" rel="noopener">test</a>');
	});
});


test('Can be used with custom options by PostHTML', async t => {
	return addAttributes('<a href="https://bing.com/">test</a>', {elements: []})
	.then(result => {
		t.is(result, '<a href="https://bing.com/">test</a>');
	});
});


test('Can combine PostHTML and options parser', async t => {
	return addAttributes('<a href="https://bing.com/">test</a>', {
		...defaultOptions,
		parsed: true,
		noopener: false
	})
	.then(result => {
		t.is(result, '<a href="https://bing.com/">test</a>');
	});
});


test('Can use options parser separately', t => {
	t.deepEqual(parser(), {
		...defaultOptions,
		parsed: true,
		elements: [{tag: 'a'}, {tag: 'area'}, {tag: 'form'}]
	});

	t.deepEqual(parser({noopener: false}), {
		...defaultOptions,
		parsed: true,
		elements: [{tag: 'a'}, {tag: 'area'}, {tag: 'form'}],
		noopener: false
	});

	t.deepEqual(parser({noreferrer: true}), {
		...defaultOptions,
		parsed: true,
		elements: [{tag: 'a'}, {tag: 'area'}, {tag: 'form'}],
		noreferrer: true
	});

	t.deepEqual(parser({ignore: /foo/}), {
		...defaultOptions,
		parsed: true,
		elements: [{tag: 'a'}, {tag: 'area'}, {tag: 'form'}],
		ignore: /foo/
	});

	t.deepEqual(parser({elements: ['a']}), {
		...defaultOptions,
		parsed: true,
		elements: [{tag: 'a'}]
	});
});