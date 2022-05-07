/* eslint-disable */

let audioContext
let frequencyData
let analyserNode
let currentHue = 0
let maxFrequencyTarget = 0
let audio
let p5

// Mimic some package constants
const CLOSE = 'close'
const TWO_PI = Math.PI * 2
const CORNER = 'corner'
const CORNERS = 'corners'
const CENTER = 'center'
const RADIUS = 'radius'
const HSL = 'hsl'
const width = 300
const height = width


export const playAudioVisual = audioSrc => {
	// Only initiate audio upon a user gesture
	if (!audioContext) {
		audioContext = new AudioContext()

		// Make a stream source, i.e. MP3, microphone, etc
		// In this case we choose an <audio> element
		audio = document.createElement('audio')

		// Upon loading the audio, let's play it
		audio.addEventListener(
			'canplay',
			() => {
				// First, ensure the context is in a resumed state
				audioContext.resume()
				// Now, play the audio
				audio.play()
			},
			{ once: true },
		)

		// Enable looping
		audio.loop = false

		// Set source
		audio.crossOrigin = 'Anonymous'
		audio.src = audioSrc.includes('ipfs://')
			? audioSrc.replace('ipfs://', 'https://nftstorage.link/ipfs/')
			: audioSrc

		// Connect source into the WebAudio context
		const source = audioContext.createMediaElementSource(audio)
		source.connect(audioContext.destination)

		analyserNode = audioContext.createAnalyser()

		const detail = 4
		analyserNode.fftSize = 2048 * detail

		analyserNode.minDecibels = -100
		analyserNode.maxDecibels = -50
		frequencyData = new Float32Array(analyserNode.frequencyBinCount)

		source.connect(analyserNode)
	} else {
		audio.pause()
		audioContext.close()
		audioContext = null
	}
}

// Convert the frequency in Hz to an index in the array
function frequencyToIndex(frequencyHz, sampleRate, frequencyBinCount) {
	const nyquist = sampleRate / 2
	const index = Math.round((frequencyHz / nyquist) * frequencyBinCount)
	return Math.min(frequencyBinCount, Math.max(0, index))
}

// Convert an index in a array to a frequency in Hz
function indexToFrequency(index, sampleRate, frequencyBinCount) {
	return (index * sampleRate) / (frequencyBinCount * 2)
}

// Get the normalized audio signal (0..1) between two frequencies
function audioSignal(p5, analyser, frequencies, minHz, maxHz) {
	if (!analyser) return 0
	const sampleRate = analyser.context.sampleRate
	const binCount = analyser.frequencyBinCount
	let start = frequencyToIndex(minHz, sampleRate, binCount)
	const end = frequencyToIndex(maxHz, sampleRate, binCount)
	const count = end - start
	let sum = 0
	for (; start < end; start++) {
		sum += frequencies[start]
	}

	const minDb = analyserNode.minDecibels
	const maxDb = analyserNode.maxDecibels
	const valueDb = count === 0 || !isFinite(sum) ? minDb : sum / count
	return p5.map(valueDb, minDb, maxDb, 0, 1, true)
}

// Find the frequency band that has the most peak signal
// Captures the running average peak frequency over a running audio source
function audioMaxFrequency(analyserNode, frequencies) {
	let maxSignal = -Infinity
	let maxSignalIndex = 0
	for (let i = 0; i < frequencies.length; i++) {
		const signal = frequencies[i]
		if (signal > maxSignal) {
			maxSignal = signal
			maxSignalIndex = i
		}
	}
	return indexToFrequency(
		maxSignalIndex,
		analyserNode.context.sampleRate,
		analyserNode.frequencyBinCount,
	)
}

// This is a very useful, reusable helper function
// This helps smoothly interpolate things from one frame to the next
// Lower the lambda, the slower things will change, the higher, the faster
function damp(p5, a, b, lambda, dt) {
	return p5.lerp(a, b, 1 - Math.exp(-lambda * dt))
}

// function windowResized() {
// 	resizeCanvas(windowWidth, windowHeight)
// }

export const drawSquares = (p5, _size) => {
	// fill background
	p5.background(240)

	p5.noStroke()

	p5.rectMode(CENTER)

	if (analyserNode) {
		analyserNode.getFloatFrequencyData(frequencyData)
		maxFrequencyTarget = p5.map(
			audioMaxFrequency(analyserNode, frequencyData),
			0,
			500,
			0,
			360,
			true,
		)
	}

	const cx = _size / 2
	const cy = _size / 2
	const dim = p5.min(_size, _size)

	p5.colorMode(HSL)
	// Smooth out the transition
	currentHue = damp(p5, currentHue, maxFrequencyTarget, 0.001, p5.deltaTime)

	let hueA = currentHue
	let hueB = (hueA + 45) % 360
	const colorA = p5.color(hueA, 50, 50)
	const colorB = p5.color(hueB, 50, 50)

	const maxSize = dim * 0.75
	const minSize = dim * 0.15

	const count = 6

	p5.background(currentHue, 50, 50)

	for (let i = 0; i < count; i++) {
		const t = p5.map(i, 0, count - 1, 0, 1)
		const c = p5.color((currentHue + 90 * ((i + 1) / count)) % 360, 50, 50)

		const minBaseHz = 200
		const maxBaseHz = 2000
		const minHz = p5.map(count - i, 0, count, minBaseHz, maxBaseHz)
		const maxHz = p5.map(count - i + 1, 0, count, minBaseHz, maxBaseHz)

		const signal = analyserNode ? audioSignal(p5, analyserNode, frequencyData, minHz, maxHz) : 0

		const baseSize = p5.map(i, 0, count - 1, maxSize, minSize)
		const size = baseSize + (maxSize / 4) * signal
		const edge = 0.5

		p5.fill(c)
		p5.rect(cx, cy + ((maxSize - size) * edge) / 2, size, size)
	}

	if (!audioContext) {
		// Draw a play button
		const dim = p5.min(_size, _size)
		p5.fill('white')
		p5.noStroke()
		polygon(p5, _size / 2, _size / 2, dim * 0.1, 3)
	}
}

// Draw a basic polygon, handles triangles, squares, pentagons, etc
function polygon(p5, x, y, radius, sides = 3, angle = 0) {
	p5.beginShape()
	for (let i = 0; i < sides; i++) {
		const a = angle + TWO_PI * (i / sides)
		let sx = x + p5.cos(a) * radius
		let sy = y + p5.sin(a) * radius
		p5.vertex(sx, sy)
	}
	p5.endShape(CLOSE)
}
