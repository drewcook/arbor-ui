import axios from 'axios'

// Create Axios instance
const host = process.env.CLIENT_HOST
const instance = axios.create({ baseURL: host });

/**
 * A generic GET request wrapper to ease use within React
 * @param pathname - The name of the API route
 * @param params - Any params to be passed in
 * @returns - Resources from our database
 */
export const get = async (pathname: string, params?: any): Promise<any> => {
	try {
		const { data } = await instance.get(`/api${pathname}`, params)
		return data
	} catch (e: any) {
    console.error(e)
		return { success: false }
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
		const res = await instance.post(`/api${pathname}`, data)
		return res.data
	} catch (e: any) {
    console.error(e)
		return { success: false }
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
    console.error(e)
		return { success: false }
	}
}
