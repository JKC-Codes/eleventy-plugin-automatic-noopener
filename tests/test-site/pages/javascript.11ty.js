class page {
	data() {
		return {
			title: "JavaScript"
		};
	}

	render({tests}) {
		return tests.reduce((acc, cur) => {
			let target = cur.target ? ` target="${cur.target}"` : '';
			let rel = cur.rel ? ` rel="${cur.rel}"` : '';

			return `${acc}<a href="${cur.href}"${target}${rel}>test</a>
`;
		}, '');
	}
}

module.exports = page;