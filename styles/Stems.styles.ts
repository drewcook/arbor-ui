export const indexStyles = {
	title: {
		textTransform: 'uppercase',
		fontStyle: 'italic',
		fontWeight: 800,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		mb: 2,
	},
	subtitle: {
		fontStyle: 'italic',
		fontWeight: 300,
		textAlign: 'center',
		mb: 7,
	},
	noProjects: {
		textAlign: 'center',
	},
	noProjectsMsg: {
		fontSize: '1.5rem',
		color: '#555',
		mb: 3,
	},
	icons: {
		float: 'right',
		mb: 3,
	},
	stemListBtn: {
		'&.MuiButton-contained': {
			background: '#000',
			color: '#fff',
		},
	},
}

export const detailsStyles = {
	error: {
		textAlign: 'center',
		marginY: 4,
	},
	headingWrap: {
		position: 'relative',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	playWrap: {
		mr: 2,
		height: '100%',
		width: '96px',
		'&::before': {
			content: '""',
			display: 'block',
			backgroundColor: '#000',
			width: '3px',
			height: '100%',
			position: 'absolute',
			bottom: '0',
			left: '43px',
		},
	},
	playBtn: {
		position: 'absolute',
		borderRadius: '10px',
		top: 0,
		width: '90px',
		height: '90px',
		backgroundColor: '#000',
		color: '#fff',
		boxShadow: 'none',
		'&:hover, &.Mui-disabled': {
			backgroundColor: '#444',
			color: '#fff',
		},
		'&.Mui-disabled': {
			cursor: 'not-allowed',
			pointerEvents: 'none',
		},
	},
	playIcon: {
		fontSize: '4rem',
	},
	loopBtn: {
		position: 'absolute',
		borderRadius: '6px',
		top: 110,
		left: 26,
		width: '36px',
		height: '36px',
		backgroundColor: '#000',
		color: '#fff',
		boxShadow: 'none',
		'&:hover, &.Mui-disabled': {
			backgroundColor: '#444',
			color: '#fff',
		},
		'&.Mui-disabled': {
			cursor: 'not-allowed',
			pointerEvents: 'none',
		},
		'&.looping': {
			backgroundColor: '#E95D87',
			color: '#000',
		},
	},
	loopIcon: {
		fontSize: '1.25rem',
	},
	title: {
		textTransform: 'uppercase',
		fontStyle: 'italic',
		fontWeight: 800,
		mb: 2,
		display: 'flex',
		alignItems: 'center',
	},
	eyebrow: {
		fontStyle: 'italic',
		fontWeight: 300,
		textTransform: 'uppercase',
		color: '#777',
	},
	desc: {
		color: '#777',
		fontSize: '18px',
		mb: 2,
		fontWeight: 300,
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
		borderColor: '#000',
		borderWidth: '10px',
		borderTopLeftRadius: '10px',
		borderTopRightRadius: '10px',
	},
}
