const styles = {
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
		'&[data-color="red"]': {
			backgroundColor: '#FFA1A1',
		},
		'&[data-color="purple"]': {
			backgroundColor: '#D6A1FF',
		},
		'&[data-color="blue"]': {
			backgroundColor: '#A1EEFF',
		},
		'&[data-color="yellow"]': {
			backgroundColor: '#FDFFA1',
		},
		'&[data-color="multi"]': {
			background: 'linear-gradient(94.22deg, #FFA1A1 9.36%, #A1AAFF 33.65%, #A1EEFF 65.94%, #FDFFA1 89.96%);',
		},
	},
}
export default styles
