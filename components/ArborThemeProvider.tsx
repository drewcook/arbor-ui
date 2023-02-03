import { createTheme, ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'

type ThemeProviderProps = {
	children: ReactNode
}

declare module '@mui/material/styles' {
	interface Palette {
		swatchVocal: Palette['primary']
		swatchDrums: Palette['primary']
		swatchPercussion: PaletteOptions['primary']
		swatchBass: Palette['primary']
		swatchChords: Palette['primary']
		swatchMelody: Palette['primary']
		swatchCombo: Palette['primary']
		swatchOther: Palette['primary']
	}
	interface PaletteOptions {
		reds: string[]
		neutrals: Record<string, string>
		swatchVocal: PaletteOptions['primary']
		swatchDrums: PaletteOptions['primary']
		swatchPercussion: PaletteOptions['primary']
		swatchBass: PaletteOptions['primary']
		swatchChords: PaletteOptions['primary']
		swatchMelody: PaletteOptions['primary']
		swatchCombo: PaletteOptions['primary']
		swatchOther: PaletteOptions['primary']
	}
}

export const stemTypesToColor: Record<string, string> = {
	vocals: '#7E0017',
	drums: '#C9184A',
	percussion: '#E74B7A',
	bass: '#FFD6D8',
	chords: '#20163B',
	melody: '#5E548E',
	combo: '#9F86C0',
	other: '#D8C5F2',
}

// const neutralsToColor: Record<string, string> = {
// 	white: '#FFFFFF',
// 	light: '#F1E6E6',
// 	medium: '#B6A0A0',
// 	med4: '#696061',
// 	dark: '#1B2021',
// }

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
			main: '#1B2021',
			contrastText: '#F1F1F1',
		},
		secondary: {
			main: '#C9184A',
			contrastText: '#F1F1F1',
		},
		error: { light: '#FF3333', main: '#D10000', dark: '#8F0000', contrastText: '' },
		warning: { light: '#FEB571', main: '#FE922F', dark: '#DF6501', contrastText: '' },
		info: { light: '#99DFFF', main: '#50BBFF', dark: '#005FA3', contrastText: '' },
		success: { light: '#31F500', main: '#25B800', dark: '#187A00', contrastText: '' },
		// grey: {10: '', 20, '', ...{}},
		// action: { ,..{} },
		text: {
			primary: '#1B2021',
			secondary: '#30343F',
			disabled: '#B9BDCB',
		},
		divider: '#3C3839',
		background: {
			default: '#F1F1F1',
			paper: '#F1F1F1',
		},
		reds: [
			'#FFEBEB',
			'#FFD6D6',
			'#FFC2C2',
			'#FFADAD',
			'#FF9999',
			'#FF8585',
			'#FF7070',
			'#FF5C5C',
			'#FF4747',
			'#FF3333',
			'#FF1F1F',
			'#FF0A0A',
			'#F50000',
		],
		// melon: '#FFB8B0',
		// coral: '#FC898F',
		// blush: '#E95D87',
		// jam: '#901148',
		neutrals: {
			lightest: '#FFFFFF',
			lighter: '#F1E6E6',
			light: '#B6A0A0',
			medium: '#5D4F51',
			dark: '#3C3839',
			darker: '#1B2021',
			darkest: '#0C0101',
		},
		swatchVocal: {
			main: '#7E0017',
			contrastText: '#111',
		},
		swatchDrums: {
			main: '#C9184A',
			contrastText: '#111',
		},
		swatchPercussion: {
			main: '#E74B7A',
			contrastText: '#111',
		},
		swatchBass: {
			main: '#FFD6D8',
			contrastText: '#111',
		},
		swatchChords: {
			main: '#20163B',
			contrastText: '#111',
		},
		swatchMelody: {
			main: '#5E548E',
			contrastText: '#111',
		},
		swatchCombo: {
			main: '#9F86C0',
			contrastText: '#111',
		},
		swatchOther: {
			main: '#D8C5F2',
			contrastText: '#111',
		},
	},
})

const ArborThemeProvider = ({ children }: ThemeProviderProps): JSX.Element => (
	<ThemeProvider theme={arborTheme}>{children}</ThemeProvider>
)

export default ArborThemeProvider
