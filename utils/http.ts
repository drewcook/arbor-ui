import axios from 'axios'

export const get = async (path: string, params?: any): Promise<any> => {
	try {
		const { data } = await axios.get(`http://localhost:3000/api${path}`, params)
		return data
	} catch (e) {
		console.error(e)
	}
}

export const post = async (path: string, data?: any): Promise<any> => {
	try {
		const res = await axios.post(`http://localhost:3000/api${path}`, data)
		console.log({ res })
		return res.data
	} catch (e) {
		console.error(e)
	}
}
