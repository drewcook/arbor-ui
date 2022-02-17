import axios from 'axios'

export const get = async (path: string, params?: any): Promise<any> => {
	try {
		const { data } = await axios.get(`http://localhost:3000/api${path}`, params)
		return data
	} catch (e: any) {
    console.error(e)
		return { success: false }
	}
}

export const post = async (path: string, data?: any): Promise<any> => {
	try {
		const res = await axios.post(`http://localhost:3000/api${path}`, data)
		return res.data
	} catch (e: any) {
    console.error(e)
		return { success: false }
	}
}
