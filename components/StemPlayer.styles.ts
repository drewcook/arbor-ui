const styles = {
	stem: {
		borderLeft: '3px solid #000',
		borderRight: '3px solid #000',
		borderBottom: '3px solid #111',
	},
	btnsWrap: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	header: {
		py: 1,
		px: 2,
	},
	metadataPlayBtn: {
		color: '#fff',
		minWidth: '50px',
		mr: 2,
	},
	title: {
		mr: 4,
		fontSize: '1.5rem',
		display: 'inline-block',
		textTransform: 'uppercase',
		fontStyle: 'italic',
		fontWeight: 800,
		wordBreak: 'break-all',
	},
	addedBy: {
		display: 'inline-block',
		color: '#5a5a5a',
		fontStyle: 'italic',
		fontSize: '.75rem',
		verticalAlign: 'super',
	},
	addressLink: {
		color: '#000',
		fontSize: '.9rem',
		fontWeight: 600,
		display: 'inline-block',
		verticalAlign: 'middle',
	},
	forkBtn: {
		backgroundColor: '#fff',
		textTransform: 'uppercase',
		fontWeight: 800,
		'&:hover': {
			backgroundColor: '#f5f5f5',
		},
	},
	playback: {
		backgroundColor: '#f4f4f4',
		py: 3,
		px: 2,
	},
	btnGroup: {
		mt: 1,
	},
}

export default styles
