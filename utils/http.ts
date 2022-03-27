import axios, { AxiosInstance } from 'axios'
import _cloneDeep from 'lodash/cloneDeep'
console.log('host', process.env.CLIENT_HOST)
// Create Axios instance using the hostname for baseurl
const instance: AxiosInstance =
	process.env.CLIENT_HOST === 'test' // We store this for Vercel Preview builds
		? axios.create() // Use Vercel preview ephemeral URLs for base url
		: axios.create({ baseURL: process.env.CLIENT_HOST }) // Use env vars stored

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
		console.error(e)
		return { success: false, error: e }
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
		return { success: false, error: e }
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
		return { success: false, error: e }
	}
}
