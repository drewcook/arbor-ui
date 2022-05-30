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
		border: '1px solid #aaa',
	},
	submitBtn: {
		fontWeight: 800,
		fontStyle: 'italic',
		textTransform: 'uppercase',
	},
	loadingIcon: {
		my: 0.4,
	},
	swatchDrums: {
		backgroundColor: '#FFA1A1',
	},
	swatchBass: {
		backgroundColor: '#D6A1FF',
	},
	swatchChords: {
		backgroundColor: '#FDFFA1',
	},
	swatchMelody: {
		backgroundColor: '#A1EEFF',
	},
	swatchVocals: {
		backgroundColor: '#A1FFBB',
	},
	swatchCombo: {
		backgroundColor: '#FFA1F0',
	},
	swatchOther: {
		backgroundColor: '#FFC467',
	},
}

export default styles
