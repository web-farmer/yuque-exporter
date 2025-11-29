/**
 * @Author: wei
 * @Date: 2023/3/14 20:24
 * @Description: repos.ts
 */
import { defineEventHandler, getHeaders, getQuery } from 'h3'
import yaml from 'yaml'
import { listTransferTree } from '../utils'
import request from '../utils/request'
import type { IBookCatalog, IBookDetail } from '~/types'

export default defineEventHandler(async event => {
    try {
        const headers = getHeaders(event)
        const { namespace } = getQuery(event)
        if (namespace) {
            // 有知识库名称，获取对应详情数据
            const { data } = await request({
                headers,
                url: `/repos/${namespace}`,
                method: 'get'
            })
            const { toc_yml: toc, slug } = data

            // 目录列表转成树
            const repoDetail: IBookDetail = {
                ...data,
                docList: yaml.parse(toc).filter((item: IBookCatalog) => item.type !== 'META'),
                docTree: listTransferTree(
                    yaml.parse(toc).filter((item: IBookCatalog) => item.type !== 'META'),
                    '',
                    '/' + slug
                )
            }
            delete repoDetail.toc_yml
            delete repoDetail.user
            return {
                code: 200,
                data: repoDetail,
                message: 'ok',
                time: Date.now()
            }
        } else {
            // 获取当前用户知识库列表
            // 先获取当前登录用户信息
            const user = await request({
                headers,
                url: '/user',
                method: 'get'
            })
            const { login } = user.data
            const res = await request({
                headers,
                url: `/users/${login}/repos`,
                method: 'get'
            })
            return {
                code: 200,
                data: res.data,
                message: 'ok',
                time: Date.now()
            }
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
