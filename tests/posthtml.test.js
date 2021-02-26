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
	return addAttributes('<a href="https://bing.com/" target="_blank">test</a>')
	.then(result => {
		t.is(result, '<a href="https://bing.com/" target="_blank" rel="noopener">test</a>');
	});
});


test('Can be used with custom options by PostHTML', async t => {
	return addAttributes('<a href="https://bing.com/" target="_blank">test</a>', {noreferrer: true})
	.then(result => {
		t.is(result, '<a href="https://bing.com/" target="_blank" rel="noreferrer">test</a>');
	});
});


test('Can combine PostHTML and options parser', async t => {
	return addAttributes('<a href="https://bing.com/" target="_blank">test</a>', {
		...defaultOptions,
		parsed: true,
		noreferrer: true
	})
	.then(result => {
		t.is(result, '<a href="https://bing.com/" target="_blank" rel="noreferrer">test</a>');
	});
});


test('Can use options parser separately', t => {
	t.deepEqual(parser(), {
		...defaultOptions,
		parsed: true,
		elements: ['a', 'area', 'form']
	});

	t.deepEqual(parser({noopener: false}), {
		...defaultOptions,
		parsed: true,
		elements: ['a', 'area', 'form'],
		noopener: false
	});

	t.deepEqual(parser({noreferrer: true}), {
		...defaultOptions,
		parsed: true,
		elements: ['a', 'area', 'form'],
		noreferrer: true
	});

	t.deepEqual(parser({ignore: /foo/}), {
		...defaultOptions,
		parsed: true,
		elements: ['a', 'area', 'form'],
		ignore: /foo/
	});

	t.deepEqual(parser({elements: ['a']}), {
		...defaultOptions,
		parsed: true,
		elements: ['a']
	});
});