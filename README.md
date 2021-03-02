# Automatic Noopener
An [11ty](https://www.11ty.dev/) plugin that automatically adds a `rel="noopener"` or `rel="noreferrer"` attribute to all external links.


- [Installation](#installation)
- [Usage](#usage)
	- [PostHTML](#posthtml)
- [Configuration](#configuration)
	- [ignore](#ignore)
	- [elements](#elements)
	- [noopener](#noopener)
	- [noreferrer](#noreferrer)
- [Licence](#licence)


## Installation

```shell
npm install eleventy-plugin-automatic-noopener
```


## Usage

In your [Eleventy config file](https://www.11ty.dev/docs/config/) (`.eleventy.js` by default):
```js
const automaticNoopener = require('eleventy-plugin-automatic-noopener');

module.exports = function(eleventyConfig) {
	eleventyConfig.addPlugin(automaticNoopener);
}
```


### PostHTML
Automatic Noopener provides a [PostHTML](https://posthtml.org/) compatible version so you can reduce build times by reusing an existing PostHTML syntax tree.

The `posthtml` export provides a stand-alone version of Automatic Noopener. This could even be used outside of Eleventy.

The optional `parser` export provides an options parser to further reduce build times when using Eleventy's `--watch` or `--serve` options. Parsing your options outside of the transform will mean this is only done once at the start of watching or serving rather than every time Eleventy builds.

```js
const posthtml = require('posthtml');
const anotherPostHTMLPlugin = require('another-posthtml-plugin');
const { posthtml: automaticNoopener, parser } = require('eleventy-plugin-automatic-noopener');
const options = parser({noreferrer: true});

module.exports = function(eleventyConfig) {
	eleventyConfig.addTransform('posthtml', function(HTMLString, outputPath) {
		if(outputPath && outputPath.endsWith('.html')) {
			return posthtml([automaticNoopener(options), anotherPostHTMLPlugin()])
				.process(HTMLString)
				.then(result => result.html));
		}
		else {
			return HTMLString;
		}
	});
}
```


## Configuration
```js
const automaticNoopener = require('eleventy-plugin-automatic-noopener');

module.exports = function(eleventyConfig) {
	eleventyConfig.addPlugin(automaticNoopener, {
		ignore: /^https?:\/\/google\.com(\/|$)/i,
		elements: ['a', 'area', 'form']
		noopener: true,
		noreferrer: false,
	});
}
```


### ignore
- Default: null
- Accepts: Regular Expression

Any URLs that match the given regular expression will not cause `rel="noopener"` or `rel="noreferrer"` attributes to be added to their corresponding element.


### elements
- Default: ['a', 'area', 'form']
- Accepts: Array of Strings

The elements to add `rel="noopener"` or `rel="noreferrer"` to. Strings must be 'a', 'area' or 'form'.


### noopener
- Default: True
- Accepts: Boolean

Add a `rel="noopener"` attribute to all elements with external links that don't have a `rel="noreferrer"` attribute on them. Ignored if [noreferrer](#noreferrer) is true.


### noreferrer
- Default: False
- Accepts: Boolean

Add a `rel="noreferrer"` attribute to all elements with external links.


## Licence
[GNU GPLv3 ](https://choosealicense.com/licenses/gpl-3.0/)