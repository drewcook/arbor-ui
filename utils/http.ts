import axios from 'axios'

const host = process.env.CLIENT_HOST

export const get = async (pathname: string, params?: any): Promise<any> => {
  console.log({host})
	try {
		const { data } = await axios.get(`/api${pathname}`, params)
		return data
	} catch (e: any) {
    console.error(e)
		return { success: false }
	}
}

export const post = async (pathname: string, data?: any): Promise<any> => {
  console.log({host})
	try {
		const res = await axios.post(`/api${pathname}`, data)
		return res.data
	} catch (e: any) {
    console.error(e)
		return { success: false }
	}
}
