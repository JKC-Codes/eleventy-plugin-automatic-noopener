module.exports = function(options) {
	// AST = Abstract Syntax Tree from HTML Parser
	return function(AST) {
		AST.match(options.elements, node => {
			if(notIgnored(node, options.ignore, AST)) {
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


function notIgnored(node, regEx, tree) {
	let links = [];

	if(node.tag !== 'form' && node.attrs && node.attrs.href) {
		links.push(node.attrs.href.trim());
	}
	else if(node.tag === 'form') {
		links = getFormLinks(node, tree);
	}

	// Check if any link is external or included in the ignore option
	return links.some(link => {
		const isManuallyIgnored = regEx && regEx.test(link.trim());
		// Ensure that we don't accidentally match an existing link on page
		const randomDomain = 'automaticnoopenerplugin' + Math.floor(Math.random() * 89999 + 10000);
		const isInternalLink = new URL(link, `https://${randomDomain}.com/`).host === `${randomDomain}.com`;

		return !(isManuallyIgnored || isInternalLink);
	});
}

function getFormLinks(node, tree) {
	const formLinks = [];
	const formactionElements = [
		{tag: 'button'},
		{tag: 'input', attrs: {type: 'submit'}},
		{tag: 'input', attrs: {type: 'image'}}
	];

	// Action attribute contains the URL on forms
	if(node.attrs && node.attrs.action) {
		formLinks.push(node.attrs.action.trim());
	}

	// Check for nested elements in the form with a formaction attribute which can override the form's URL
	tree.match.call(node, formactionElements, node => {
		if(node.attrs && node.attrs.formaction) {
			formLinks.push(node.attrs.formaction.trim());
		}

		return node;
	});

	// If form has an ID check for elements anywhere in the document with a formaction attribute which can override the form's URL
	if(node.attrs && node.attrs.id) {
		tree.match(formactionElements, formactionNode => {
			const hasFormaction = formactionNode.attrs && formactionNode.attrs.formaction;
			// Regex = start of string or whitespace + ID value + end of string or whitespace
			const IDRegEx = new RegExp(`(^|\s)${node.attrs.id}($|\s)`, 'i');
			const linksToForm = formactionNode.attrs && IDRegEx.test(formactionNode.attrs.form);

			if(hasFormaction && linksToForm) {
				formLinks.push(formactionNode.attrs.formaction.trim());
			}

			return formactionNode;
		});
	}

	return formLinks;
}

function addRelValue(node, value) {
	if(!node.attrs || !node.attrs.rel) {
		node.attrs.rel = value;
	}
	// Regex = start of string or whitespace + given value + end of string or whitespace
	else if(!new RegExp(String.raw`(^|\s)(${value}|noreferrer)($|\s)`, 'i').test(node.attrs.rel)) {
		// Regex = whitespace at end of string
		if(!/\s$/.test(node.attrs.rel)) {
			value = ' ' + value;
		}

		node.attrs.rel += value;
	}
}