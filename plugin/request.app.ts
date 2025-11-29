/**
 * @Author: wei
 * @Date: 2022/5/16 21:29
 * @Description: request.ts.js
 */

import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
const pre = import.meta.env.MODE === 'development' ? '/' : '/'
const config: any = {
    baseURL: `${pre}api`
}
console.log(config)
const request: any = axios.create(config)

request.interceptors.request.use((config: AxiosRequestConfig | any) => {
    // 添加token
    config.headers['x-auth-token'] = window.localStorage.getItem('yuque_token') || ''
    console.log('app.url --->', config.url)
    return config
})

request.interceptors.response.use(
    (res: AxiosResponse) => {
        if (res.status === 200 && res.data.code === 200) {
            return Promise.resolve(res.data)
        }
        console.log('request.res -->', res)
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
                        ElMessage.error(res.data?.message || res.statusText || '服务异常，请重试')
                        return Promise.reject(res)
                    } else {
                        ElMessage.error(res.data?.message || res.statusText || '服务异常，请重试')
                        return Promise.reject(res)
                    }
                }
                reader.onerror = err => {
                    res.data = err
                    ElMessage.error(res.data?.message || res.statusText || '服务异常，请重试')
                    return Promise.reject(res)
                }
                reader.readAsText(data)
            } else {
                // 文件流返回
                return Promise.resolve(res)
            }
        } else {
            ElMessage.error(res.data?.message || res.statusText || '服务异常，请重试')
            return Promise.reject(res)
        }
    },
    (e: any) => {
        console.error('request.e -->', e)
        ElMessage.error(
            e?.response?.data?.message || e?.response?.message || e.message || e.statusText || '服务异常，请重试'
        )
        return Promise.reject(e)
    }
)

export default request
