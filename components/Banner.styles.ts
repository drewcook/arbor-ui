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
}

export default styles
