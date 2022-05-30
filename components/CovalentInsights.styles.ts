const styles = {
	covalentWrap: {
		p: 2,
		mb: 2,
		background: '#fafafa',
		border: '1px solid #ccc',
	},
	cardTitle: {
		mb: 3,
	},
	covalentBtn: {
		mb: 2,
	},
	numMinted: {
		fontWeight: 300,
		fontSize: '2.5rem',
		display: 'inline-block',
		ml: 2,
		verticalAlign: 'sub',
	},
	tokenRow: {
		py: 2,
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderBottom: '1px solid #ccc',
		'&:last-of-type': {
			borderBottom: 0,
		},
	},
	txRow: {
		textAlign: 'left',
		p: 2,
	},
	covalentMeta: {
		display: 'block',
		mb: 5,
		fontSize: '1rem',
		lineHeight: '1.3rem',
	},
}

export default styles
