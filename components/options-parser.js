module.exports = function(userOptions = {}) {
	const parsedOptions = {};

	for(const [key, value] of Object.entries(userOptions)) {
		if(value === undefined || value === null) {
			continue;
		}

		switch(key.toLowerCase()) {
			case 'noopener':
			case 'noreferrer':
				Object.assign(parsedOptions, validateBoolean(key.toLowerCase(), value));
			break;

			case 'ignore': Object.assign(parsedOptions, validateIgnore(value));
			break;

			case 'elements': Object.assign(parsedOptions, validateElements(value));
			break;

			default: throw new Error(`Automatic Noopener plugin received an unrecognised option: ${key}`);
		}
	}

	parsedOptions.parsed = true;
	return parsedOptions;
}


function validateBoolean(key, value) {
	if(typeof value !== 'boolean') {
		throw new Error(`Automatic Noopener plugin requires the ${key} option to be a Boolean. Received ${typeof value}: ${JSON.stringify(value)}`);
	}
	else {
		return {[key]: value};
	}
}

function validateIgnore(value) {
	if(value instanceof RegExp) {
		return {ignore: value};
	}
	else {
		throw new Error(`Automatic Noopener plugin requires the ignore option to be a Regular Expression. Received ${typeof value}: ${JSON.stringify(value)}`);
	}
}

function validateElements(elements) {
	if(!Array.isArray(elements)) {
		throw new Error(`Automatic Noopener plugin requires the elements option to be an Array. Received ${typeof elements}`);
	}
	else if(elements.some(element => typeof element !== 'string')) {
		const invalidElements = elements
			.filter(element => {
				return typeof element !== 'string';
			})
			.reduce((acc, cur) => {
				return acc += `${typeof cur}: ${JSON.stringify(cur)}, `;
			}, '')
			.slice(0, -2);

		throw new Error(`Automatic Noopener plugin requires the elements option to contain only Strings. Received: ${invalidElements}`);
	}
	else {
		const validElements = ['a', 'area', 'form'];
		const uniqueElements = new Set();

		elements.forEach(element => {
			element = element.trim().toLowerCase();

			if(validElements.includes(element)) {
				uniqueElements.add(element);
			}
			else {
				throw new Error(`Automatic Noopener plugin requires the elements option to contain 'a', 'area' and/or 'form'. Received: ${JSON.stringify(element)}`);
			}
		});

		const parsedElements = Array.from(uniqueElements).map(element => {
			return {tag: element};
		});

		return {elements: parsedElements};
	}
}