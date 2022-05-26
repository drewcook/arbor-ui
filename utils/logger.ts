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
	// Colors
	private fgBlack = '\x1b[30m%s\x1b[0m'
	private fgRed = '\x1b[31m%s\x1b[0m'
	private fgGreen = '\x1b[32m%s\x1b[0m'
	private fgYellow = '\x1b[33m%s\x1b[0m'
	private fgBlue = '\x1b[34m%s\x1b[0m'
	private fgMagenta = '\x1b[35m%s\x1b[0m'
	private fgCyan = '\x1b[36m%s\x1b[0m'
	private fgWhite = '\x1b[37m%s\x1b[0m'

	// Loggers
	public black = (logData: any): void => {
		console.log(this.fgBlack, logData)
	}

	public red = (logData: any): void => {
		console.log(this.fgRed, logData)
	}

	public green = (logData: any): void => {
		console.log(this.fgGreen, logData)
	}

	public yellow = (logData: any): void => {
		console.log(this.fgYellow, logData)
	}

	public blue = (logData: any): void => {
		console.log(this.fgBlue, logData)
	}

	public magenta = (logData: any): void => {
		console.log(this.fgMagenta, logData)
	}

	public cyan = (logData: any): void => {
		console.log(this.fgCyan, logData)
	}

	public white = (logData: any): void => {
		console.log(this.fgWhite, logData)
	}
}

export default new Logger()
