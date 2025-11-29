/**
 * @Author: wei
 * @Date: 2023/3/14 20:24
 * @Description: export.ts
 */
import { defineEventHandler, getHeaders, getQuery, type RequestHeaders, sendStream } from 'h3'
import yaml from 'yaml'
import dayjs from 'dayjs'
import request from '../utils/request'
import { getDocsBody, getDocsZip, listTransferTree } from '~/server/utils'
import type { IBookCatalog } from '~/types'

/**
 * @desc 获取知识库所有文档
 * @param namespace
 * @param headers
 */
const getDocList = async (namespace: any, headers: RequestHeaders): Promise<any> => {
    // 有知识库名称，获取对应详情数据
    const { data } = await request({
        headers,
        url: `/repos/${namespace}`,
        method: 'get'
    })
    const { toc_yml: toc, name, slug } = data
    // 目录列表转成树
    const docList = yaml.parse(toc).filter((item: IBookCatalog) => item.type !== 'META')
    // 目录列表转成树
    const docTree = listTransferTree(docList, '', '/' + slug)
    return {
        docList: docList.filter((item: IBookCatalog) => !!item.url),
        docTree,
        repoName: name
    }
}

// 导出文档
const exportDocs = async (namespace: any, headers: RequestHeaders) => {
    try {
        const { docList, docTree, repoName } = await getDocList(namespace, headers)
        const { docMap } = await getDocsBody(namespace, docList, headers)
        const content = await getDocsZip(docTree || [], docMap, repoName, headers)
        return {
            content,
            repoName
        }
    } catch (e) {
        console.log('exportDocs.e', e)
        throw e
    }
}

export default defineEventHandler(async event => {
    try {
        const headers: RequestHeaders = getHeaders(event)
        // url知识库路径
        const { namespace } = getQuery(event)
        if (!namespace) {
            return {
                code: 500,
                message: 'namespace不能为空',
                time: Date.now()
            }
        } else {
            const { content, repoName } = await exportDocs(namespace, headers)
            const fileName = encodeURIComponent(`${repoName}.${dayjs().format('YYYY.MM.DD')}.zip`)
            // 添加响应头，文件名信息
            event.node.res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
            return sendStream(event, content as any)
        }
    } catch (e: any) {
        return {
            code: e?.response?.status || e?.status || e?.statusCode || 500,
            data: e || e,
            message:
                e?.response?.data?.message || e?.response?.message || e.message || e.statusText || '服务异常，请重试',
            time: Date.now()
        }
    }
})
