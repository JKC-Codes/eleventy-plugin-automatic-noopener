module.exports = function(options) {
	const relevantTags = Array.from(options.elements);

	if(relevantTags.includes('form')) {
		relevantTags.push('button');
	}

	// AST = Abstract Syntax Tree from HTML Parser
	return function(AST) {
		// Plugin is 'turned off'
		if(!options.noreferrer && !options.noopener) {
			return AST;
		}

		// List of relevant elements to be iterated over
		const elements = {
			a: [],
			area: [],
			form: [],
			button: []
		};

		AST.walk(node => {
			const tag = node.tag && node.tag.toLowerCase();

			if(tag && relevantTags.includes(tag)) {
				elements[tag].push(node);
			}

			return node;
		});

		makeLinksSafe(elements, options);
		makeFormsSafe(elements, options, AST);

		return AST;
	};
}


function makeLinksSafe(elements, options) {
	elements['a'].concat(elements['area']).forEach(node => {
		if(node.attrs) {
			const state = {
				done: false,
				hasNoopener: false,
				hasUnsafeLink: false,
				hasUnsafeTarget: false
			}
			const rel = node.attrs[getAttributeKey('rel', node.attrs)];

			if(hasWord('(?:noreferrer|opener)', rel)) {
				// No need to add a rel attribute
				return;
			}
			else if(hasWord('noopener', rel)) {
				state.hasNoopener = true;
			}

			const link = node.attrs[getAttributeKey('href', node.attrs)];
			const target = node.attrs[getAttributeKey('target', node.attrs)];

			updateUnsafeStatus(link, target, state, node, options);
		}
	})
}

function makeFormsSafe(elements, options, tree) {
	elements['form'].forEach(form => {
		const state = {
			done: false,
			hasNoopener: false,
			hasUnsafeLink: false,
			hasUnsafeTarget: false
		}

		// Action attribute contains the URL on forms
		if(form.attrs) {
			const rel = form.attrs[getAttributeKey('rel', form.attrs)];

			if(hasWord('(?:noreferrer|opener)', rel)) {
				// No need to add a rel attribute
				return;
			}
			else if(hasWord('noopener', rel)) {
				state.hasNoopener = true;
			}

			const link = form.attrs[getAttributeKey('action', form.attrs)];
			const target = form.attrs[getAttributeKey('target', form.attrs)];

			updateUnsafeStatus(link, target, state, form, options);
		}

		if(state.done) {
			return;
		}

		// Check for nested buttons or inputs in the form with an overriding formaction/formtarget attribute
		tree.walk.call(form, formChild => {
			if(state.done || !formChild.tag || !formChild.attrs) {
				return formChild;
			}

			const tag = formChild.tag.toLowerCase();
			const type = formChild.attrs[getAttributeKey('type', formChild.attrs)];
			const hasTypeButton = type && type.trim().toLowerCase() === 'button';
			const hasTypeReset = type && type.trim().toLowerCase() === 'reset';
			const hasTypeImage = type && type.trim().toLowerCase() === 'image';
			const hasTypeSubmit = type && type.trim().toLowerCase() === 'submit';
			const isRelevantButton = tag === 'button' && !hasTypeButton && !hasTypeReset;
			const isRelevantInput = tag === 'input' && (hasTypeImage || hasTypeSubmit);

			if(isRelevantButton || isRelevantInput) {
				if(!state.hasUnsafeLink) {
					const link = formChild.attrs[getAttributeKey('formaction', formChild.attrs)];
					updateUnsafeStatus(link, null, state, form, options);
				}

				if(!state.hasUnsafeTarget) {
					const target = formChild.attrs[getAttributeKey('formtarget', formChild.attrs)];
					updateUnsafeStatus(null, target, state, form, options);
				}
			}

			return formChild;
		})

		if(state.done) {
			return;
		}

		// If form has an ID, check for buttons anywhere in the document with an overriding formaction/formtarget attribute
		const formID = form.attrs && form.attrs[getAttributeKey('id', form.attrs)];

		if(!formID) {
			return;
		}

		for(let button of elements['button']) {
			if(!button.attrs) {
				continue;
			}

			const formAttribute = button.attrs[getAttributeKey('form', button.attrs)];
			const hasReleventFormAttribute = formAttribute && formAttribute.trim() === formID;
			const type = button.attrs[getAttributeKey('type', button.attrs)];
			const hasButtonType = type && type.trim().toLowerCase() === 'button';
			const hasResetType = type && type.trim().toLowerCase() === 'reset';

			if(hasReleventFormAttribute && !hasButtonType && !hasResetType) {
				if(!state.hasUnsafeLink) {
					const link = button.attrs[getAttributeKey('formaction', button.attrs)];
					updateUnsafeStatus(link, null, state, form, options);
				}

				if(!state.hasUnsafeTarget) {
					const target = button.attrs[getAttributeKey('formtarget', button.attrs)];
					updateUnsafeStatus(null, target, state, form, options);
				}
			}

			if(state.done) {
				break;
			}
		}
	})
}

function getAttributeKey(attribute, attributes) {
	if(!attributes) {
		return undefined;
	}

	// Can't access key directly because of case sensitivity
	for(const key of Object.keys(attributes)) {
		if(key.toLowerCase() === attribute.toLowerCase()) {
			return key;
		}
	}
}

function hasWord(word, string) {
	// Regex = start of string or whitespace + word + end of string or whitespace
	return new RegExp(String.raw`(?:^|\s)${word}(?:$|\s)`, 'i').test(string);
}

function getUnsafeTargetStatus(target) {
	if(target) {
		const safeTargets = ['_parent', '_self', '_top'];

		target = !safeTargets.includes(target.trim().toLowerCase());
	}

	return target;
}

function updateUnsafeStatus(link, target, state, node, options) {
	if(link && !state.hasUnsafeLink) {
		const hasExternalLink = getExternalLinkStatus(link);
		const isIgnored = options.ignore && options.ignore.test(link);

		if(hasExternalLink && !isIgnored) {
			state.hasUnsafeLink = true;
		}
	}

	if(state.hasUnsafeLink && options.noreferrer) {
		addRel(node, options, state);
		return;
	}

	if(target && !state.hasUnsafeTarget) {
		state.hasUnsafeTarget = getUnsafeTargetStatus(target);
	}

	if(state.hasUnsafeLink && options.noopener && !state.hasNoopener && state.hasUnsafeTarget) {
		addRel(node, options, state);
		return;
	}

	function addRel(node, options, state) {
		if(!node.attrs) {
			node.attrs = {};
		}

		addRelAttribute(node.attrs, options);
		state.done = true;
	}
}

function getExternalLinkStatus(link) {
	if(link) {
		link = link.trim();
		// Ensure that an existing link on the page isn't matched
		const randomDomain = 'automaticnoopenerplugin' + Math.floor(Math.random() * 89999 + 10000);
		const isInternalLink = new URL(link, `https://${randomDomain}.com/`).host === `${randomDomain}.com`;

		link = !isInternalLink;
	}

	return link;
}

function addRelAttribute(attributes, options) {
	const relKey = getAttributeKey('rel', attributes);
	let newValue;

	if(options.noreferrer) {
		newValue = 'noreferrer';
	}
	else if(options.noopener) {
		newValue = 'noopener';
	}

	if(!relKey) {
		attributes.rel = newValue;
	}
	else {
		// Regex = non-whitespace at end of string
		if(/\S$/.test(attributes[relKey])) {
			newValue = ' ' + newValue;
		}

		attributes[relKey] += newValue;
	}
}