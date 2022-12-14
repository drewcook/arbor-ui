import axios, { AxiosInstance, AxiosRequestHeaders } from 'axios'
import normalizeHeaderName from 'axios/lib/helpers/normalizeHeaderName'
import utils from 'axios/lib/utils'
import _cloneDeep from 'lodash/cloneDeep'

const JSONBI = require('json-bigint')({ useNativeBigInt: true })

const setHeaderIfUnset = (headers: AxiosRequestHeaders | undefined, headerName: string, value: string) => {
	if (headers && !utils.isUndefined(headers) && utils.isUndefined(headers[headerName])) {
		headers[headerName] = value
	}
}

// Create Axios instance
// See https://axios-http.com/docs/req_config
const instance: AxiosInstance = axios.create({
	// We store this for Vercel Preview builds
	baseURL:
		// Check heroku builds
		!!process.env.HEROKU_APP_NAME
			? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`
			: // Check vercel builds
			process.env.VERCEL_ENV === 'preview' && !!process.env.VERCEL_URL
			? `https://${process.env.VERCEL_URL}`
			: // Use test build and clear out, i.e. use as a fallback
			process.env.CLIENT_HOST === 'test'
			? ''
			: // Use env vars stored, likely production
			  process.env.CLIENT_HOST,

	// Since JSON.stringify(BigInt) fails, we need a custom stringify handler using 'json-bigint'
	// See https://gist.github.com/itsTalwar/d34758a5f1199e3fc3269eb364d087e8
	// Or https://stackoverflow.com/questions/43787712/axios-how-to-deal-with-big-integers
	transformRequest: [
		(data, headers) => {
			// normalize
			normalizeHeaderName(headers, 'Accept')
			normalizeHeaderName(headers, 'Content-Type')
			// support all connections
			setHeaderIfUnset(headers, 'Access-Control-Allow-Origin', '*')
			// transform data
			if (
				utils.isFormData(data) ||
				utils.isArrayBuffer(data) ||
				utils.isBuffer(data) ||
				utils.isStream(data) ||
				utils.isFile(data) ||
				utils.isBlob(data)
			) {
				return data
			}
			if (utils.isArrayBufferView(data)) {
				return data.buffer
			}
			// update content type
			if (utils.isURLSearchParams(data)) {
				setHeaderIfUnset(headers, 'Content-Type', 'application/x-www-form-urlencoded;charset=utf-8')
				return data.toString()
			}
			if (utils.isObject(data)) {
				setHeaderIfUnset(headers, 'Content-Type', 'application/json;charset=utf-8')
				return JSONBI.stringify(data)
			}
			// update cors info
			return data
		},
	],
})

/**
 * A generic GET request wrapper to ease use within React
 * @param pathname - The name of the API route
 * @param params - Any params to be passed in
 * @returns - Resources from our database
 */
export const get = async (pathname: string, params?: any): Promise<any> => {
	try {
		const { data } = await instance.get(`/api${pathname}`, { params })
		return data
	} catch (e: any) {
		return { success: false, error: e.message }
	}
}

/**
 * A generic POST request wrapper to ease use within React
 * @param pathname - The name of the API route
 * @param data - Any data to be passed in
 * @returns - Resources from our database
 */
export const post = async (pathname: string, data?: any): Promise<any> => {
	try {
		const res = await instance.post(`/api${pathname}`, _cloneDeep(data))
		return res.data
	} catch (e: any) {
		return { success: false, error: e.message }
	}
}

/**
 * A generic PUT request wrapper to ease use within React
 * @param pathname - The name of the API route
 * @param data - Any data to be passed in
 * @returns - Resources from our database
 */
export const update = async (pathname: string, data?: any): Promise<any> => {
	try {
		const res = await instance.put(`/api${pathname}`, data)
		return res.data
	} catch (e: any) {
		return { success: false, error: e.message }
	}
}

/**
 * A generic DELETE request wrapper to ease use within React
 * @param pathname - The name of the API route
 * @param data - Any data to be passed in
 * @returns - Resources from our database
 */
export const remove = async (pathname: string, data?: any): Promise<any> => {
	try {
		const res = await instance.delete(`/api${pathname}`, { data: _cloneDeep(data) })
		return res.data
	} catch (e: any) {
		return { success: false, error: e.message }
	}
}
