/**
 * @Author: wei
 * @Date: 2023/3/29 09:10
 * @Description: utils.js
 */
import type { RequestHeaders } from 'h3'
import JSZip from 'jszip'
import type { IBookCatalog, IDocMap } from '~/types'
import request from '~/server/utils/request'
// 文档库路径/语雀中用到

// markdown中语雀图片正则
const imgReg = /!\[.*?\]\((https:\/\/cdn.*?)\)/g

/**
 * @desc 匹配目标字符串中的图片链接
 * @param target
 */
const matchImg = function (target: string) {
    return target.match(imgReg)
}

/**
 * @desc 列表转树结构
 * @param list
 * @param parentUuid
 * @param bookPath vitepress sidebar link
 * @param link
 **/
const listTransferTree = (list: IBookCatalog[], parentUuid: string | number, bookPath: string, link?: string) => {
    const res: IBookCatalog[] = []
    for (const item of list) {
        if (item.parent_uuid === parentUuid) {
            const children: any = listTransferTree(list, item?.uuid || '', bookPath, `${link || ''}/${item.title}`)
            if (children.length) {
                item.items = children
                item.collapsed = false
            } else {
                item.link = `${bookPath}${link || ''}/${item.title}`
                if (!parentUuid) {
                    item.items = []
                }
            }
            res.push({
                id: item.id,
                type: item.type,
                title: item.title,
                text: item.title,
                url: item.url || item.uuid,
                link: item.link,
                collapsed: item.collapsed,
                items: item.items
            })
        }
    }
    return res
}

/**
 * @desc 获取所有文档内容
 * @param namespace
 * @param docs
 * @param headers
 * @return {Promise<{repoName: string, docMap: T}>}
 */
const getDocsBody = async (namespace: any, docs: IBookCatalog[], headers: RequestHeaders) => {
    try {
        // 所有文档的请求
        const requests = docs
            .filter((item: IBookCatalog) => item.type === 'DOC' && !!item.url)
            .map((item: IBookCatalog, index: number) => {
                const groupIndex = Math.floor(index / 20) + 1
                const delay = groupIndex * 1000.0

                // 防止频繁请求
                return new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        try {
                            const res = await request(`/repos/${namespace}/docs/${item.url}`, {
                                headers
                            })
                            resolve(res)
                        } catch (e) {
                            reject(e)
                        }
                    }, delay)
                })
            })
        const res = await Promise.all(requests)
        const docMap: any = (res || []).reduce((sum: any, item: any) => {
            const { body, title, id, slug } = item.data
            const doc = {
                [slug]: {
                    id,
                    body,
                    title
                }
            }
            return {
                ...sum,
                ...doc
            }
        }, {})
        return {
            docMap
        }
    } catch (e) {
        console.log('getDocsBody.e', 'e')
        throw e
    }
}

/**
 * 获取文档图片等静态资源
 * @param zip
 * @param body
 * @param title
 * @param headers
 */
const getDocAssets = async (zip: any, body: string, title: any, headers: RequestHeaders) => {
    let realBody = body
    // 匹配markdown中所有的语雀图片cdn地址
    const images = matchImg(body)
    if (!images || !images.length) {
        // 没有图片
        return realBody
    }
    for (const src of images || []) {
        // 替换![]()，拿到图片地址
        const realImgSrc = src.replace(/((!\[.*?\])|\(|\))/g, '')
        // 匹配图片名称
        const fileName = realImgSrc.match(/\/([\w-]+\.(?:png|jpe?g|gif|svg|webp))/i)
        // toDo ?=和?:的区别
        // 获取图片base64，并保存图片
        if (fileName) {
            const imgData = await getImgData(realImgSrc, headers)
            const imgName = `${title}-${fileName[1]}`
            zip.file(imgName, imgData, { base64: true })
            // 替换原有cdn地址为本地地址
            realBody = realBody.replace(realImgSrc, imgName)
        }
    }
    return realBody
}

/**
 * @desc 获取图片base64
 * @param src
 * @param apiHeaders
 */
const getImgData = async function (src: string, apiHeaders: RequestHeaders) {
    try {
        const headers: any = {
            'x-auth-token': apiHeaders['x-auth-token'],
            'user-agent': apiHeaders['user-agent']
        }
        const res: any = await request(src, {
            responseType: 'arraybuffer',
            headers
        })
        // 防止频繁请求
        return new Promise(resolve => {
            setTimeout(() => {
                try {
                    // 转成base64
                    const base64Image: any = Buffer.from(res, 'binary').toString('base64')
                    resolve(base64Image)
                } catch (e) {
                    console.log('Buffer.e', e)
                    throw e
                }
            }, 100)
        })
    } catch (e) {
        console.log('getImage.e', e)
        throw e
    }
}

/**
 * @desc 压缩文件并导出
 * @param zip
 * @param items
 * @param docMap
 * @param headers
 * @return {Promise<void>}
 */
const fileZip = async (zip: any, items: IBookCatalog[], docMap: any, headers: RequestHeaders) => {
    for (const item of items || []) {
        const { title, url, type } = item
        // 文档类型节点，有URL
        if (type === 'DOC' && !!url) {
            // 根据URL获取文章内容
            const body = docMap[url]?.body
            if (body) {
                try {
                    const realBody = await getDocAssets(zip, body, title, headers)
                    // 保存markdown
                    // <a name="jpRNc"></a> 替换
                    zip.file(`${title}.md`, `# ${title}\n${realBody.replace(/<a name="\w+"><\/a>/gi, '')}`)
                } catch (e) {
                    console.log('zipFile.e', e)
                    throw e
                }
            } else {
                zip.file(`${title}.md`, `# ${title}\n`)
            }
        }
        // 递归进行文件压缩
        if (item.items && item.items.length) {
            // 创建子文件夹
            const folder = zip.folder(title)
            await fileZip(folder, item.items, docMap, headers)
        }
    }
}

/**
 * @desc 生成文档压缩包
 * @param list
 * @param docMap
 * @param repoName
 * @param headers
 * @return {Promise<Buffer>}
 */
const getDocsZip = async (list: IBookCatalog[], docMap: IDocMap, repoName: any, headers: RequestHeaders) => {
    try {
        // jszip初始化
        const zip = new JSZip()
        // 创建根目录
        const folder = zip.folder(repoName || 'docs')
        await fileZip(folder, list, docMap, headers)
        // 生成压缩内容/必须是generateNodeStream
        return await zip.generateNodeStream({
            type: 'nodebuffer', // nodejs用
            streamFiles: true
        })
    } catch (e) {
        console.log('zipBook.e', e)
        throw e
    }
}

export { listTransferTree, getDocsBody, matchImg, getDocAssets, getImgData, getDocsZip }
