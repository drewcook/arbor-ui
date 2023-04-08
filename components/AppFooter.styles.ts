const styles = {
	footer: {
		backgroundColor: '#fff',
		color: '#1B2021',
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
		background: '#fff',

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
