const styles = {
	footer: {
		backgroundColor: '#1B2021',
		color: '#F1F1F1',
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
		mt: 4,
		mb: 1,
	},
	socialIcon: {
		display: 'inline-block',
		mx: 1,
		cursor: 'pointer',
		background: '#1B2021',

		'&:hover': {
			opacity: 0.5,
		},
	},
	copy: {
		mt: 2,
		textAlign: 'center',
	},
}

export default styles
