const styles = {
	footer: {
		backgroundColor: '#000',
		color: '#111',
		display: 'flex',
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		px: 2,
		pb: 2,
		'&.stuck': {
			position: 'fixed',
			bottom: 0,
			width: '100%',
		},
	},
	social: {
		my: 4,
	},
	socialIcon: {
		display: 'inline-block',
		mx: 1,
		cursor: 'pointer',
		'&:hover': {
			opacity: 0.5,
		},
	},
	copy: {
		textAlign: 'center',
	},
}

export default styles
