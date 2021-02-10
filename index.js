const postHTML = require('posthtml');
const defaultOptions = require('./components/options-default.js');
const parseOptions = require('./components/options-parser.js');
const addAttributes = require('./components/add-attributes.js');


module.exports = function(eleventyConfig, userOptions) {
	const options = Object.assign({}, defaultOptions, parseOptions(userOptions));

	eleventyConfig.addTransform('automaticNoopener', function(HTMLString, outputPath) {
		if(outputPath && outputPath.endsWith('.html')) {
			return postHTML([addAttributes(options)])
			.process(HTMLString)
			.then(result => result.html);
		}
		else {
			return HTMLString;
		}
	});
}


module.exports.posthtml = function(options = {}) {
	if(!options.parsed) {
		options = Object.assign({}, defaultOptions, parseOptions(options));
	}

	return function(AST) {
		return addAttributes(options)(AST);
	}
}


module.exports.parser = function(userOptions) {
	return Object.assign({}, defaultOptions, parseOptions(userOptions));
}