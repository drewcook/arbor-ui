import { createTheme, ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'

type ThemeProviderProps = {
	children: ReactNode
}

declare module '@mui/material/styles' {
	interface Palette {
		swatchDrums: Palette['primary']
		swatchBass: Palette['primary']
		swatchChords: Palette['primary']
		swatchMelody: Palette['primary']
		swatchVocal: Palette['primary']
		swatchCombo: Palette['primary']
		swatchOther: Palette['primary']
	}
	interface PaletteOptions {
		swatchDrums: PaletteOptions['primary']
		swatchBass: PaletteOptions['primary']
		swatchChords: PaletteOptions['primary']
		swatchMelody: PaletteOptions['primary']
		swatchVocal: PaletteOptions['primary']
		swatchCombo: PaletteOptions['primary']
		swatchOther: PaletteOptions['primary']
	}
}

const arborTheme = createTheme({
	typography: {
		fontFamily: ['Kanit', 'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"'].join(
			',',
		),
	},
	palette: {
		mode: 'dark',
		// Colors
		primary: {
			main: '#C9184A',
			contrastText: '#F1F1F1',
		},
		secondary: {
			main: '#E74B7A',
			contrastText: '#F1F1F1',
		},
		/*
			error: { light: '', main: '', dark: '', contrastText: '' },
			warning: { light: '', main: '', dark: '', contrastText: '' },
			info: { light: '', main: '', dark: '', contrastText: '' },
			success: { light: '', main: '', dark: '', contrastText: '' },
			grey: {10: '', 20, '', ...}
			action: { ,.. }
		*/
		text: {
			primary: '#1B2021',
			secondary: '#30343F',
			disabled: '#B9BDCB',
		},
		divider: '#B9BDCB',
		background: {
			default: '#F1F1F1',
			paper: '#F1F1F1',
		},
		// Swatches for stem categories
		swatchDrums: {
			main: '#FFA1A1',
			contrastText: '#111',
		},
		swatchBass: {
			main: '#D6A1FF',
			contrastText: '#111',
		},
		swatchChords: {
			main: '#FDFFA1',
			contrastText: '#111',
		},
		swatchMelody: {
			main: '#A1EEFF',
			contrastText: '#111',
		},
		swatchVocal: {
			main: '#A1FFBB',
			contrastText: '#111',
		},
		swatchCombo: {
			main: '#FFA1F0',
			contrastText: '#111',
		},
		swatchOther: {
			main: '##FFC467',
			contrastText: '#111',
		},

		// Variants

		variants: {},
	},
})

const ArborThemeProvider = ({ children }: ThemeProviderProps): JSX.Element => (
	<ThemeProvider theme={arborTheme}>{children}</ThemeProvider>
)

export default ArborThemeProvider
