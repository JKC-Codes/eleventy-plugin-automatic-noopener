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
			const link = node.attrs[getAttributeKey('href', node.attrs)];
			const rel = node.attrs[getAttributeKey('rel', node.attrs)];
			const target = node.attrs[getAttributeKey('target', node.attrs)];
			const needsAttribute = getAttributeNeed(link, rel, target, options);

			if(needsAttribute) {
				addAttribute(node.attrs, options);
			}
		}
	})
}

function makeFormsSafe(elements, options, tree) {
	elements['form'].forEach(form => {
		const status = {
			form,
			options,
			done: false,
			hasNoopener: false,
			hasUnsafeLink: false, // external link that isn't ignored
			hasUnsafeTarget: false // non-_blank target attribute
		}

		// Action attribute contains the URL on forms
		if(form.attrs) {
			const rel = form.attrs[getAttributeKey('rel', form.attrs)];

			if(hasWord('(?:noreferrer|opener)', rel)) {
				// No need to add a rel attribute
				return;
			}
			else if(hasWord('noopener', rel)) {
				status.hasNoopener = true;
			}

			const link = form.attrs[getAttributeKey('action', form.attrs)];
			const target = form.attrs[getAttributeKey('target', form.attrs)];

			updateUnsafeStatus(link, target, status);
		}

		// Check for nested buttons or inputs in the form with an overriding formaction/formtarget attribute
		tree.walk.call(form, formChild => {
			if(status.done || !formChild.tag || !formChild.attrs) {
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
				if(!status.hasUnsafeLink) {
					const link = formChild.attrs[getAttributeKey('formaction', formChild.attrs)];
					updateUnsafeStatus(link, null, status);
				}

				if(!status.hasUnsafeTarget) {
					const target = formChild.attrs[getAttributeKey('formtarget', formChild.attrs)];
					updateUnsafeStatus(null, target, status);
				}
			}

			return formChild;
		})

		// If form has an ID, check for buttons anywhere in the document with an overriding formaction/formtarget attribute
		const formID = form.attrs && form.attrs[getAttributeKey('id', form.attrs)];

		if(status.done || !formID) {
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
				if(!status.hasUnsafeLink) {
					const link = button.attrs[getAttributeKey('formaction', button.attrs)];
					updateUnsafeStatus(link, null, status);
				}

				if(!status.hasUnsafeTarget) {
					const target = button.attrs[getAttributeKey('formtarget', button.attrs)];
					updateUnsafeStatus(null, target, status);
				}
			}

			if(status.done) {
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

function getAttributeNeed(link, rel, target, options) {
	const hasExternalLink = getExternalLinkStatus(link);
	const isIgnored = options.ignore && options.ignore.test(link);
	const hasNoreferrerOrOpener = hasWord('(?:noreferrer|opener)', rel);

	if(hasExternalLink && !isIgnored && !hasNoreferrerOrOpener) {
		if(options.noreferrer) {
			return true;
		}

		const hasNoopener = hasWord('noopener', rel);
		const hasUnsafeTarget = getUnsafeTargetStatus(target);

		if(options.noopener && !hasNoopener && hasUnsafeTarget) {
			return true;
		}
	}

	return false;
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

function hasWord(word, string) {
	// Regex = start of string or whitespace + word + end of string or whitespace
	return new RegExp(`(?:^|\s)${word}(?:$|\s)`, 'i').test(string);
}

function getUnsafeTargetStatus(target) {
	if(target) {
		const safeTargets = ['_parent', '_self', '_top'];

		target = !safeTargets.includes(target.trim().toLowerCase());
	}

	return target;
}

function addAttribute(attributes, options) {
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

function updateUnsafeStatus(link, target, status) {
	if(link && !status.hasUnsafeLink) {
		const hasExternalLink = getExternalLinkStatus(link);
		const isIgnored = status.options.ignore && status.options.ignore.test(link);

		if(hasExternalLink && !isIgnored) {
			status.hasUnsafeLink = getExternalLinkStatus(link);
		}
	}

	if(target && !status.hasUnsafeTarget) {
		status.hasUnsafeTarget = getUnsafeTargetStatus(target);
	}

	if(status.hasUnsafeLink) {
		const needsOpener = status.options.noopener && !status.hasNoopener && status.hasUnsafeTarget;

		if(status.options.noreferrer || needsOpener) {
			if(!status.form.attrs) {
				status.form.attrs = {};
			}

			addAttribute(status.form.attrs, status.options);
			status.done = true;
		}
	}
}