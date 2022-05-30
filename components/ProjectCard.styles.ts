const styles = {
	limitReachedChip: {
		textTransform: 'uppercase',
		fontWeight: 800,
		fontSize: '1rem',
		position: 'absolute',
		top: '1.5rem',
		right: '-1rem',
		backgroundColor: '#ff399f',
		py: 2.5,
		color: '#fff',
		zIndex: 1,
	},
	card: {
		minWidth: '200px',
		position: 'relative',
		overflow: 'visible',
	},
	cardMedia: {
		backgroundColor: '#111',
		borderTopLeftRadius: '4px',
		borderTopRightRadius: '4px',
		borderBottom: '3px solid #4CE79D',
		py: 1,
		px: 1.5,
	},
	cardMediaIcon: {
		color: '#fff',
		fontSize: '2rem',
	},
	collaborators: {
		textTransform: 'uppercase',
		color: '#a8a8a8',
		fontWeight: 600,
		mb: 1,
	},
	description: {
		fontWeight: 300,
		mb: 2,
	},
	tag: {
		m: 1,
	},
	actions: {
		justifyContent: 'flex-end',
	},
}

export default styles
