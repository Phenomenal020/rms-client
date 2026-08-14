import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    withCredentials: true,
})

export const fetcher = async (url: string) => {
    const response = await axiosInstance.get(url)
    console.log('debugging axios response', response)
    return response.data
}