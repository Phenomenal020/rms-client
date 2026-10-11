import axios from 'axios';
import { getApiOrigin } from '@/src/api-base-url';

export const axiosInstance = axios.create({
    baseURL: getApiOrigin(),
    withCredentials: true,
})

export const fetcher = async (url: string) => {
    const response = await axiosInstance.get(url)
    return response.data
}