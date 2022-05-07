// import { useEffect } from 'react'
import { drawSquares, playAudioVisual } from '../utils/frequencyUtils'
import PropTypes from 'prop-types'
import { Box } from '@mui/material'
import p5Types from 'p5'
import dynamic from 'next/dynamic'

const Sketch = dynamic(() => import('react-p5'), { ssr: false })

const styles = (size: number) => ({
	wrapper: {
		cursor: 'pointer',
		width: `${size}px`,
		height: `${size}px`,
		backgroundColor: '#000',
		boxSizing: 'content-box',
		border: '3px solid #000',
		borderRadius: '8px',
		'&:hover': {
			'.react-p5': {
				opacity: 0.96,
			},
		},
	},
})

const AudioVisual = (props): JSX.Element => {
	const { audio, size } = props

	// See: https://levelup.gitconnected.com/integrating-p5-sketches-into-your-react-app-de44a8c74e91
	const setup = (p5: p5Types, canvasParentRef: Element) => {
		// This is a square image
		p5.createCanvas(size, size).parent(canvasParentRef)
		// Optional:
		// If the user inserts/removes bluetooth headphones or pushes
		// the play/pause media keys, we can use the following to ignore the action
		navigator.mediaSession.setActionHandler('pause', () => {}) // eslint-disable-line
	}

	const draw = (p5: p5Types) => drawSquares(p5, size)

	return (
		<Box sx={styles(size).wrapper} className="sketchAv" onClick={() => playAudioVisual(audio.href)}>
			<Sketch setup={setup} draw={draw} />
		</Box>
	)
}

AudioVisual.propTypes = {
	audio: PropTypes.shape({
		url: PropTypes.string,
		href: PropTypes.string,
	}),
	size: PropTypes.number,
}

AudioVisual.defaultProps = {
	size: 400,
}

export default AudioVisual
