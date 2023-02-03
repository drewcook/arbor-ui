const styles = {
	title: {
		flex: 1,
		p: 0,
	},
	text: {
		textAlign: 'left',
		mb: 3,
	},
	fileMeta: {
		display: 'block',
		lineHeight: 1.3,
		mb: 0.5,
		'&:last-of-type': {
			mb: 2,
		},
	},
	selectInput: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	listItem: {
		py: 1.25,
	},
	swatch: {
		width: '1.5rem',
		height: '1.5rem',
		borderRadius: '4px',
		mr: 3,
		border: '1px solid #B9BDCB',
	},
	submitBtn: {
		fontWeight: 800,
		fontStyle: 'italic',
		textTransform: 'uppercase',
	},
	loadingIcon: {
		my: 0.4,
	},
	swatchVocal: {
		backgroundColor: '#7E0017',
	},
	swatchDrums: {
		backgroundColor: '#C9184A',
	},
	swatchPercussion: {
		backgroundColor: '#E74B7A',
	},
	swatchBass: {
		backgroundColor: '#FFD6D8',
	},
	swatchChords: {
		backgroundColor: '#20163B',
	},
	swatchMelody: {
		backgroundColor: '#5E548E',
	},
	swatchCombo: {
		backgroundColor: '#9F86C0',
	},
	swatchOther: {
		backgroundColor: '#D8C5F2',
	},
}

export default styles
