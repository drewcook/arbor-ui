import { createTheme, ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'

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

const polyEchoTheme = createTheme({
	typography: {
		fontFamily: ['Kanit', 'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"'].join(
			',',
		),
	},
	palette: {
		primary: {
			main: '#000',
			contrastText: '#fff',
		},
		secondary: {
			main: '#4CE79D',
			contrastText: '#000',
		},
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
		divider: '#ccc',
	},
})

type ProviderProps = {
	children: ReactNode
}

const PolyEchoThemeProvider = ({ children }: ProviderProps): JSX.Element => (
	<ThemeProvider theme={polyEchoTheme}>{children}</ThemeProvider>
)

export default PolyEchoThemeProvider
