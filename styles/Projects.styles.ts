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
}

export const newProjectStyles = {
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
		mb: 4,
	},
	text: {
		textAlign: 'center',
		mb: 2,
		fontWeight: 300,
		color: '#000',
		fontSize: '1.1rem',
	},
	submitBtn: {
		marginTop: 2,
		color: '#fff',
	},
}

export const detailsStyles = {
	error: {
		textAlign: 'center',
		marginY: 4,
	},
	limitReachedChip: {
		backgroundColor: '#ff399f',
		color: '#fff',
		ml: 1,
		fontSize: '.8rem',
		height: '1.75rem',
		textShadow: 'none',
		mb: 1,
	},
	headingWrap: {
		position: 'relative',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	createdBy: {
		color: '#3C3839',
		fontStyle: 'italic',
		fontWeight: 300,
		textTransform: 'uppercase',
	},
	title: {
		mb: 1,
		fontSize: '54px',
	},
	playAllWrap: {
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
	playAllBtn: {
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
	playAllIcon: {
		fontSize: '4rem',
	},
	metadataWrap: {
		mb: 1,
	},
	metadata: {
		display: 'inline-block',
		mr: 5,
	},
	metadataKey: {
		mr: 0.5,
		display: 'inline-block',
		color: '#3C3839',
	},
	desc: {
		color: '#777',
		fontSize: '18px',
		mb: 2,
		fontWeight: 300,
	},
	tag: {
		m: 1,
		fontWeight: 400,
	},
	mintAndBuy: {
		mt: 3,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	mintAndBuyBtn: {
		fontWeight: 800,
		fontStyle: 'italic',
		fontSize: '2rem',
		letterSpacing: '.5px',
		color: '#111',
		width: '225px',
	},
	price: {
		display: 'flex',
		alignItems: 'center',
		pl: 3,
	},
	eth: {
		color: '#B9BDCB',
		fontSize: '1rem',
	},
	divider: {
		my: 3,
		borderColor: '#ccc',
	},
	imgWrapper: {
		border: '3px solid #000',
		borderRadius: '10px',
		overflow: 'clip',
		maxHeight: '300px',
		maxWidth: '300px',
		m: 'auto',
		'@media (min-width: 600px)': {
			mr: 0,
		},
	},
	stemsHeader: {
		border: '3px solid #000',
		borderTopLeftRadius: '10px',
		borderTopRightRadius: '10px',
		background: 'linear-gradient(94.22deg, #20163B 9.36%, #5E548E 33.65%, #9F86C0 65.94%, #D8C5F2 89.96%)',
		color: '#FFFFFF',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		px: 3,
		py: 5,
		mt: '60px',
		position: 'relative',
		'&::before': {
			content: '""',
			display: 'block',
			backgroundColor: '#000',
			width: '3px',
			height: '60px',
			position: 'absolute',
			top: '-60px',
			left: '43px',
		},
		'.MuiAvatar-root': {
			cursor: 'pointer',
			borderColor: '#901148',
			backgroundColor: '#E95D87',
			'&:hover': {
				backgroundColor: '#FF7070',
			},
		},
	},
	stemsTitle: {
		display: 'inline-block',
		fontSize: '2rem',
		fontStyle: 'italic',
		fontWeight: 600,
		textTransform: 'uppercase',
	},
	playSection: {
		p: 2,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	playStopBtn: {
		color: '#FFADAD',
		'&:hover': {
			color: '#FFC2C2',
		},
	},
	stemsMeta: {
		display: 'flex',
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		fontStyle: 'italic',
		textTransform: 'uppercase',
	},
	avatarGroup: {
		ml: 2,
	},
	exportStemsBtn: {
		color: '#1B2021',
		fontStyle: 'italic',
		fontWeight: 800,
		textTransform: 'uppercase',
	},
	noStemsMsg: {
		textAlign: 'center',
		py: 3,
		px: 2,
		border: '3px solid #000',
		borderBottomLeftRadius: '10px',
		borderBottomRightRadius: '10px',
	},
	addStemBtn: {
		borderWidth: '3px',
		borderColor: '#111',
		borderRadius: '5px',
		fontWeight: 800,
		mt: 4,
		'&:hover': {
			borderWidth: '3px',
		},
		'&::before': {
			content: '""',
			display: 'block',
			backgroundColor: '#000',
			width: '3px',
			height: '35px', // margin top + 2px border
			position: 'absolute',
			top: '-35px',
			left: '43px',
		},
	},
}
