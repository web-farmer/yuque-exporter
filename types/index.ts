/**
 * @Author: wei
 * @Date: 2023/4/10 09:28
 * @Description: 类型声明
 */

// 知识库/列表
export interface IBook {
    label: string
    value: string
    namespace?: string
    name?: string
    children?: IBook[]
}

// 知识库目录
export interface IBookCatalog {
    type: string
    title: string
    uuid?: string
    text?: string // vitepress sidebar text
    url?: string
    doc_id?: number | string
    level?: number | string
    id?: number | string
    parent_uuid?: string
    child_uuid?: string
    prev_uuid?: string
    sibling_uuid?: number | string
    collapsed?: boolean // vitepress sidebar collapsed
    link?: string // vitepress sidebar link
    items?: IBookCatalog[]
}

// 知识库/详情
export interface IBookDetail {
    label: string
    value: string
    namespace?: string
    name?: string
    user?: any
    toc_yml?: any
    docTree?: IBookCatalog[]
}

// 文档/列表
export interface IDoc {
    id?: number
    url: string
    slug?: string
    title?: string
    created_at?: string
    updated_at?: string
}

// 文档/单篇文档详情
export interface IDocDetail {
    id?: number
    url: string
    slug?: string
    title?: string
    created_at?: string
    updated_at?: string
    body?: string
}

// 文档集合
export interface IDocMap {
    [index: string]: IDocDetail
}
