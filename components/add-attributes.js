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

		makeSafe(elements, options, AST);

		return AST;
	}
}


function makeSafe(elements, options, tree) {
	// Check all anchor and area elements
	elements['a'].concat(elements['area']).forEach(node => {
		if(node.attrs) {
			const link = node.attrs[getAttributeKey('href', node.attrs)];
			const target = node.attrs[getAttributeKey('target', node.attrs)];
			const hasUnsafeLink = getUnsafeLinkStatus(link, options.ignore);
			const hasUnsafeTarget = getUnsafeTargetStatus(target);
			const needsOpener = getOpenerNeed(node.attrs, options.noreferrer);

			if(needsOpener && hasUnsafeLink && hasUnsafeTarget) {
				addAttribute(node.attrs, options);
			}
		}
	})

	// Check all forms
	elements['form'].forEach(form => {
		let hasUnsafeLink;
		let hasUnsafeTarget;

		// Action attribute contains the URL on forms
		if(form.attrs) {
			const link = form.attrs[getAttributeKey('action', form.attrs)];
			const target = form.attrs[getAttributeKey('target', form.attrs)];
			hasUnsafeLink = getUnsafeLinkStatus(link, options.ignore);
			hasUnsafeTarget = getUnsafeTargetStatus(target);
			const needsOpener = getOpenerNeed(form.attrs, options.noreferrer);

			if(needsOpener && hasUnsafeLink && hasUnsafeTarget) {
				addAttribute(form.attrs, options);
				return;
			}
			else if(!needsOpener) {
				return;
			}
		}

		// Check for nested buttons or inputs in the form with an overriding formaction/formtarget attribute
		tree.walk.call(form, formChild => {
			if((hasUnsafeLink && hasUnsafeTarget) || !formChild.tag || !formChild.attrs) {
				return formChild;
			}

			const tag = formChild.tag.toLowerCase();
			const type = formChild.attrs[getAttributeKey('type', formChild.attrs)];
			const hasButtonType = type && type.trim().toLowerCase() === 'button';
			const hasResetType = type && type.trim().toLowerCase() === 'reset';
			const hasImageType = type && type.trim().toLowerCase() === 'image';
			const hasSubmitType = type && type.trim().toLowerCase() === 'submit';
			const isRelevantButton = tag === 'button' && !hasButtonType && !hasResetType;
			const isRelevantInput = tag === 'input' && (hasImageType || hasSubmitType)

			if(isRelevantButton || isRelevantInput) {
				if(!hasUnsafeLink) {
					const link = formChild.attrs[getAttributeKey('formaction', formChild.attrs)];
					hasUnsafeLink = getUnsafeLinkStatus(link, options.ignore);
				}

				if(!hasUnsafeTarget) {
					const target = formChild.attrs[getAttributeKey('formtarget', formChild.attrs)];
					hasUnsafeTarget = getUnsafeTargetStatus(target);
				}
			}

			return formChild;
		});

		if(hasUnsafeLink && hasUnsafeTarget) {
			addAttribute(form.attrs, options);
			return;
		}

		// If form has an ID, check for buttons anywhere in the document with an overriding formaction/formtarget attribute
		const formID = form.attrs && form.attrs[getAttributeKey('id', form.attrs)];

		if(formID) {
			for(let button of elements['button']) {
				if(button.attrs) {
					const formAttribute = button.attrs[getAttributeKey('form', button.attrs)];
					const type = button.attrs[getAttributeKey('type', button.attrs)];
					const hasButtonType = type && type.trim().toLowerCase() === 'button';
					const hasResetType = type && type.trim().toLowerCase() === 'reset';

					if(formAttribute && formAttribute.trim().toLowerCase() === formID && !hasButtonType && !hasResetType) {
						if(!hasUnsafeLink) {
							const link = button.attrs[getAttributeKey('formaction', button.attrs)];
							hasUnsafeLink = getUnsafeLinkStatus(link, options.ignore);
						}

						if(!hasUnsafeTarget) {
							const target = button.attrs[getAttributeKey('formtarget', button.attrs)];
							hasUnsafeTarget = getUnsafeTargetStatus(target);
						}

						if(hasUnsafeLink && hasUnsafeTarget) {
							addAttribute(form.attrs, options);
							return;
						}
					}
				}
			}
		}
	})
}

function getOpenerNeed(attributes, noreferrer) {
	const rel = attributes[getAttributeKey('rel', attributes)];
	const hasNoreferrerOrOpener = hasWord('(?:noreferrer|opener)', rel);
	const hasNoopener = hasWord('noopener', rel);

	return hasNoreferrerOrOpener || (!noreferrer && hasNoopener) ? false : true;
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
	return new RegExp(`(?:^|\s)${word}(?:$|\s)`, 'i').test(string);
}

function getUnsafeLinkStatus(link, ignoreRegex) {
	if(link && link !== true) {
		link = link.trim().toLowerCase();
		// Ensure that an existing link on the page isn't matched
		const randomDomain = 'automaticnoopenerplugin' + Math.floor(Math.random() * 89999 + 10000);
		const isInternalLink = new URL(link, `https://${randomDomain}.com/`).host === `${randomDomain}.com`;
		const isManuallyIgnored = ignoreRegex && ignoreRegex.test(link);

		link = !isInternalLink && !isManuallyIgnored;
	}

	return link;
}

function getUnsafeTargetStatus(target) {
	if(target && target !== true) {
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