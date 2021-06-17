# Automatic Noopener
An [11ty](https://www.11ty.dev/) plugin that automatically adds a `rel="noopener"` or `rel="noreferrer"` attribute to all unsafe external links.


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
If you're already using [PostHTML](https://posthtml.org/) you can reduce build times by using the `posthtml` export as a plugin to your existing PostHTML syntax tree. It provides a stand-alone PostHTML version of Automatic Noopener that can even be used outside of Eleventy.

The optional `parser` export further reduces build times when using PostHTML with Eleventy's `--watch` or `--serve` arguments. Parsing your options outside of the transform will mean it's only done once at the start of watching or serving rather than every time Eleventy builds.

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
    elements: ['a', 'area', 'form'],
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

Add a `rel="noopener"` attribute to all elements with unsafe external links that don't have a `rel="noreferrer"` or `rel="opener"` attribute on them. Ignored if [noreferrer](#noreferrer) is true.


### noreferrer
- Default: False
- Accepts: Boolean

Add a `rel="noreferrer"` attribute to all elements with external links that don't have a `rel="opener"` attribute on them.


## Licence
[MPL-2.0](https://choosealicense.com/licenses/mpl-2.0/)