/**
 * @Author: wei
 * @Date: 2022/5/16 21:29
 * @Description: request.ts.js
 */
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'

const config: any = {
    baseURL: 'https://www.yuque.com/api/v2/'
}
const request: any = axios.create(config)

request.interceptors.request.use((config: AxiosRequestConfig | any) => {
    const headers = config.headers
    config.headers = {
        'x-auth-token': headers['x-auth-token'],
        'user-agent': headers['user-agent']
    }
    console.log('server.url --->', config.url)
    return config
})

request.interceptors.response.use(
    (res: AxiosResponse) => {
        if (res.status === 200) {
            return Promise.resolve(res.data)
        }
        // 文件流类型
        if (res.config.responseType) {
            // 文件流错误信息
            if (res.headers['content-type']?.includes('json')) {
                // 此处拿到的data才是blob
                const { data } = res
                const reader = new FileReader()
                reader.onload = () => {
                    const { result } = reader
                    if (typeof result === 'string') {
                        res.data = JSON.parse(result)
                        return Promise.reject(res)
                    } else {
                        return Promise.reject(res)
                    }
                }
                reader.onerror = err => {
                    res.data = err
                    return Promise.reject(res)
                }
                reader.readAsText(data)
            } else {
                // 文件流返回
                return Promise.resolve(res)
            }
        } else {
            return Promise.reject(res)
        }
    },
    (e: any) => {
        console.log('request.e -->', e)
        return Promise.reject(e)
    }
)

export default request
