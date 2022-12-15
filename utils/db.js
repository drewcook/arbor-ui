import mongoose from 'mongoose'

export const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
	throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
	if (cached.conn) {
		return cached.conn
	}

	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
			useNewUrlParser: true,
			useUnifiedTopology: true,
		}

		cached.promise = mongoose.connect(MONGODB_URI, opts).then(mongoose => {
			console.info(`Connected to MongoDB at ${MONGODB_URI}`)
			return mongoose
		})
	}
	cached.conn = await cached.promise
	return cached.conn
}

export default dbConnect
