const styles = {
	banner: {
		py: '100px',
		backgroundColor: '#111',
		color: '#fff',
		background: 'url("/banner_bg.png") center center no-repeat',
		backgroundSize: 'cover',
	},
	heading: {
		mb: 5,
		fontSize: '3rem',
		fontWeight: 500,
		'@media (min-width: 600px)': {
			fontSize: '5rem',
		},
	},
	subHeading: {
		mb: 1,
		span: {
			fontSize: 'inherit',
		},
	},
	sectionHeading: {
		mb: 5,
		fontSize: '3rem',
		'@media (min-width: 600px)': {
			fontSize: '4rem',
		},
	},
	howItWorksText: {
		fontSize: '1.5rem',
		mb: 7,
		'@media (min-width: 600px)': {
			fontSize: '1.75rem',
			mb: 10,
		},
	},
	features: {
		py: 10,
		textAlign: 'center',
	},
	featureBox: {
		m: 2,
		border: '3px solid #000',
		backgroundColor: '#fafafa',
	},
	featureBlock: {
		minHeight: '2.5rem',
		border: '2px solid #000',
		backgroundColor: '#fff',
		m: 2,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontWeight: 700,
		'&.bigBlock': {
			minHeight: '5rem',
			fontSize: '1.2rem',
		},
		'&[data-color="alice"]': {
			backgroundColor: '#E74B7A',
		},
		'&[data-color="bob"]': {
			backgroundColor: '#FFD6D8',
		},
		'&[data-color="charlie"]': {
			backgroundColor: '#D8C5F2',
		},
		'&[data-color="dave"]': {
			backgroundColor: '#9F86C0',
		},
		'&[data-color="multi"]': {
			background: 'linear-gradient(94.22deg, #E74B7A 9.36%, #FFD6D8 33.65%, #D8C5F2 65.94%, #9F86C0 89.96%);',
		},
	},
	about: {
		py: 10,
		backgroundColor: '#fafafa',
	},
	faq: {
		py: 10,
	},
	faqHeading: {
		mb: 5,
		fontSize: '2.5rem',
		'@media (min-width: 600px)': {
			fontSize: '3.5rem',
		},
		textAlign: 'center',
	},
	blurbBold: {
		fontWeight: 600,
		fontSize: '1.3rem',
		mb: 0.5,
	},
	blurb: {
		mb: 5,
		fontSize: '1.3rem',
	},
	btn: {
		fontWeight: 800,
		fontStyle: 'italic',
		fontSize: '1.2rem',
		letterSpacing: '.5px',
		color: '#fff',
		mt: 5,
		'@media (min-width: 600px)': {
			fontSize: '1.6rem',
		},
	},
}

export default styles
