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
		background: 'linear-gradient(94.22deg, #20163B 9.36%, #5E548E 33.65%, #9F86C0 65.94%, #D8C5F2 89.96%)',
		borderTopLeftRadius: '4px',
		borderTopRightRadius: '4px',
		borderBottom: '1px solid #3C3839',
		py: 1,
		px: 1.5,
	},
	cardMediaIcon: {
		color: '#fff',
		fontSize: '2rem',
	},
	collaborators: {
		textTransform: 'uppercase',
		color: '#3C3839',
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
