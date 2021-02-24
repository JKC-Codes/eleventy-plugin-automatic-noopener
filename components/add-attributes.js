module.exports = function(options) {
	// AST = Abstract Syntax Tree from HTML Parser
	return function(AST) {
		AST.walk(node => {
			if(node.tag && options.elements.includes(node.tag.toLowerCase()) && notIgnored(node, options.ignore, AST)) {
				if(options.noreferrer) {
					addRelValue(node, 'noreferrer');
				}
				else if(options.noopener) {
					addRelValue(node, 'noopener');
				}
			}

			return node;
		});

		return AST;
	}
}


function getAttributeKey(attribute, attributes) {
	// Can't access key directly because of case sensitivity
	for(const key of Object.keys(attributes)) {
		if(key.toLowerCase() === attribute.toLowerCase()) {
			return key;
		}
	}
}

function notIgnored(node, regEx, tree) {
	const tag = node.tag.toLowerCase();
	const hrefEntry = node.attrs && node.attrs[getAttributeKey('href', node.attrs)];
	let links = [];

	if(tag !== 'form' && hrefEntry) {
		links.push(hrefEntry.trim());
	}
	else if(tag === 'form') {
		links = getFormLinks(node, tree);
	}

	// Check if any link is external or included in the ignore option
	return links.some(link => {
		const isManuallyIgnored = regEx && regEx.test(link);
		// Ensure that we don't accidentally match an existing link on page
		const randomDomain = 'automaticnoopenerplugin' + Math.floor(Math.random() * 89999 + 10000);
		const isInternalLink = new URL(link, `https://${randomDomain}.com/`).host === `${randomDomain}.com`;

		return !(isManuallyIgnored || isInternalLink);
	});
}

function getFormLinks(node, tree) {

	function isFormactionElement(elementNode) {
		const isButton = elementNode.tag && elementNode.tag.toLowerCase() === 'button';
		const isInput = elementNode.tag && elementNode.tag.toLowerCase() === 'input';

		if(elementNode.attrs && (isButton || isInput)) {
			let hasFormaction;
			let hasTypeSubmit;
			let hasTypeImage;

			// Can't access keys directly because of case sensitivity
			for(let [key, value] of Object.entries(elementNode.attrs)) {
				key = key.toLowerCase();
				value = value.toLowerCase();

				if(key === 'formaction') {
					hasFormaction = true;
				}
				else if(key === 'type') {
					if(value === 'submit') {
						hasTypeSubmit = true;
					}
					else if(value === 'image') {
						hasTypeImage = true;
					}
				}
				else {
					continue;
				}

				if(hasFormaction && (isButton || hasTypeSubmit || hasTypeImage)) {
					return true;
				}
			}
		}

		return false;
	}


	const formLinks = [];

	// Action attribute contains the URL on forms
	const action = node.attrs && getAttributeKey('action', node.attrs);
	if(node.attrs[action]) {
		formLinks.push(node.attrs[action].trim());
	}

	// Check for nested elements in the form with a formaction attribute which can override the form's URL
	tree.walk.call(node, formChild => {
		if(isFormactionElement(formChild)) {
			formLinks.push(formChild.attrs[getAttributeKey('formaction', formChild.attrs)].trim());
		}

		return formChild;
	});

	// If form has an ID check for elements anywhere in the document with a formaction attribute which can override the form's URL
	const id = node.attrs && node.attrs[getAttributeKey('id', node.attrs)];
	if(id) {
		tree.walk(treeNode => {
			const hasFormaction = isFormactionElement(treeNode);
			// Regex = start of string or whitespace + ID value + end of string or whitespace
			const IDRegEx = new RegExp(`(?:^|\s)${id}(?:$|\s)`, 'i');
			const formAttribute = treeNode.attrs && treeNode.attrs[getAttributeKey('form', treeNode.attrs)];
			const linksToForm = formAttribute && IDRegEx.test(formAttribute);

			if(hasFormaction && linksToForm) {
				formLinks.push(treeNode.attrs[getAttributeKey('formaction', treeNode.attrs)].trim());
			}

			return treeNode;
		});
	}

	return formLinks;
}

function addRelValue(node, value) {
	const rel = node.attrs && getAttributeKey('rel', node.attrs);

	if(!rel) {
		node.attrs.rel = value;
	}
	// Regex = start of string or whitespace + given value + end of string or whitespace
	else if(!new RegExp(String.raw`(?:^|\s)(?:${value}|noreferrer)(?:$|\s)`, 'i').test(node.attrs[rel])) {
		// Regex = whitespace at end of string
		if(!/\s$/.test(node.attrs[rel])) {
			value = ' ' + value;
		}

		node.attrs[rel] += value;
	}
}