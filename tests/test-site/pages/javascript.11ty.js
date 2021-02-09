class page {
	data() {
		return {
			title: "JavaScript"
		};
	}

	render({tests}) {
		return tests.reduce((acc, cur) => {
			let rel = cur.rel ? ` rel="${cur.rel}"` : '';

			return `${acc}<a href="${cur.href}"${rel}>test</a>
`;
		}, '');
	}
}

module.exports = page;