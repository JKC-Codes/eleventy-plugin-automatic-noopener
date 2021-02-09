const automaticNoopener = require('./index.js');


module.exports = function(eleventyConfig) {
	eleventyConfig.addPlugin(automaticNoopener, {
		noopener: true,
		noreferrer: false,
		ignore: /^https?:\/\/([^\/]+\.)*google.com(\/|$)/i,
		elements: ['a', 'area', 'form']
	});

	return {
		dir: {
			input: './tests/test-site/',
			output: './tests/test-site/_site'
		}
	};
};