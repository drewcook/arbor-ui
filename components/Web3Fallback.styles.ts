const styles = {
	wrapper: {
		width: '100vw',
		height: '100vh',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center',
	},
	list: {
		border: '1px solid #ccc',
		borderRadius: '8px',
		width: '100%',
		marginTop: '3rem',
	},
	listItem: {
		justifyContent: 'space-between',
	},
	icon: {
		marginRight: '1rem',
		width: 50,
		height: 50,
	},
	btn: {
		borderColor: '#000',
		borderWidth: '3px',
		fontWeight: 600,
		fontStyle: 'italic',
		'&:hover': {
			borderWidth: '3px',
		},
	},
}

export default styles
