/**
 * @Author: wei
 * @Date: 2023/3/14 20:24
 * @Description: docs.ts
 */
import { defineEventHandler, getHeaders, readBody, sendStream } from 'h3'
import dayjs from 'dayjs'
import { getDocsBody, getDocsZip } from '~/server/utils'

export default defineEventHandler(async event => {
    try {
        // 单个文档导出
        const headers = getHeaders(event)
        const body = await readBody(event)
        const { docList, title, namespace } = body
        const { docMap } = await getDocsBody(namespace, docList, headers)
        const content = await getDocsZip(docList || [], docMap, title, headers)
        // 文件名
        const fileName = encodeURIComponent(`${title}.${dayjs().format('YYYY.MM.DD')}.zip`)
        // 添加响应头，文件名信息
        event.node.res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
        return sendStream(event, content as any)
    } catch (e: any) {
        // 添加响应头
        event.node.res.setHeader('Content-Type', `application/json`)
        return {
            code: e?.response?.status || e?.status || e?.statusCode || 500,
            data: e || e,
            message:
                e?.response?.data?.message || e?.response?.message || e.message || e.statusText || '服务异常，请重试',
            time: Date.now()
        }
    }
})
