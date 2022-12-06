const styles = {
	icon: {
		visibility: 'hidden',
	},
	table: {
		'& > *': {
			borderBottom: 'unset',
		},
		'&:hover .MuiIconButton-root': {
			visibility: 'visible',
		},
	},
	cardMediaIcon: {
		color: '#000',
		fontSize: '2rem',
	},
	detailItem: {
		textTransform: 'uppercase',
		color: '#a8a8a8',
		fontWeight: 600,
		mb: 1,
	},
	actions: {
		justifyContent: 'flex-end',
	},
}

export default styles
