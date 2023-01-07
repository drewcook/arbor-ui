const styles = {
	error: {
		textAlign: 'center',
		marginY: 4,
	},
	editProfileWrap: {
		my: 2,
	},
	avatarWrap: {
		position: 'relative',
		display: 'inline-flex',
		justifyContent: 'flex-start',
		'@media (min-width: 900px)': {
			display: 'flex',
			justifyContent: 'flex-end',
		},
	},
	avatarImg: {
		border: '3px solid #a0b3a0',
		borderRadius: '50%',
		height: 200,
		width: 200,
		m: 0,
		overflow: 'hidden',
	},
	updateAvatar: {
		position: 'absolute',
		bottom: '12px',
		right: '12px',
		backgroundColor: '#eee',
		'&:hover': {
			backgroundColor: '#ccc',
		},
	},
	metadataWrap: {
		mb: 3,
	},
	metadata: {
		display: 'inline-block',
		mr: 5,
	},
	metadataKey: {
		mr: 1,
		display: 'inline-block',
		color: '#3C3839',
	},
	divider: {
		my: 3,
		borderColor: '#ccc',
	},
	sectionMeta: {
		fontStyle: 'italic',
		fontWeight: 300,
		textTransform: 'uppercase',
		color: '#777',
		mb: 2,
	},
	sectionCount: {
		fontWeight: 300,
		color: '#777',
		ml: 1,
		fontSize: '1.5rem',
	},
	nftActionBtn: {
		m: 1,
	},
	noItemsMsg: {
		textAlign: 'center',
		marginY: 4,
	},
}

export default styles
