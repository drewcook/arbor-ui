/**
 * Creates a logger utility to log out in different colors
 * i.e. logger.blue('log me out in blue')
 */

interface ILogger {
	black(logData: any): void
	red(logData: any): void
	green(logData: any): void
	yellow(logData: any): void
	blue(logData: any): void
	magenta(logData: any): void
	cyan(logData: any): void
	white(logData: any): void
}

class Logger implements ILogger {
	// Styling
	private sReset = '\x1b[0m'
	private sBright = '\x1b[1m'
	private sDim = '\x1b[2m'
	private sUnderscore = '\x1b[4m'
	private sBlink = '\x1b[5m'
	private sReverse = '\x1b[7m'
	private sHidden = '\x1b[8m'
	// Colors
	private fgBlack = `\x1b[30m%s${this.sReset}`
	private fgRed = `\x1b[31m%s${this.sReset}`
	private fgGreen = `\x1b[32m%s${this.sReset}`
	private fgYellow = `\x1b[33m%s${this.sReset}`
	private fgBlue = `\x1b[34m%s${this.sReset}`
	private fgMagenta = `\x1b[35m%s${this.sReset}`
	private fgCyan = `\x1b[36m%s${this.sReset}`
	private fgWhite = `\x1b[37m%s${this.sReset}`
	private bgBlack = '\x1b[40m'
	private bgRed = '\x1b[41m'
	private bgGreen = '\x1b[42m'
	private bgYellow = '\x1b[43m'
	private bgBlue = '\x1b[44m'
	private bgMagenta = '\x1b[45m'
	private bgCyan = '\x1b[46m'
	private bgWhite = '\x1b[47m'

	// Loggers
	public black = (...logData: any[]): void => {
		console.log(this.fgBlack, ...logData)
	}

	public red = (...logData: any[]): void => {
		console.log(this.fgRed, ...logData)
	}

	public green = (...logData: any[]): void => {
		console.log(this.fgGreen, ...logData)
	}

	public yellow = (...logData: any[]): void => {
		console.log(this.fgYellow, ...logData)
	}

	public blue = (...logData: any[]): void => {
		console.log(this.fgBlue, ...logData)
	}

	public magenta = (...logData: any[]): void => {
		console.log(this.fgMagenta, ...logData)
	}

	public cyan = (...logData: any[]): void => {
		console.log(this.fgCyan, ...logData)
	}

	public white = (...logData: any[]): void => {
		console.log(this.fgWhite, ...logData)
	}
}

export default new Logger()
