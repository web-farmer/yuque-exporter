// https://nuxt.com/docs/api/configuration/nuxt-config
import eslint from 'vite-plugin-eslint'

export default defineNuxtConfig({
    typescript: {
        typeCheck: true
    },
    devServer: {
        port: 5001
    },
    modules: ['@element-plus/nuxt'],
    vite: {
        plugins: [eslint()]
    },
    elementPlus: {
        icon: 'ElIcon',
        importStyle: 'scss',
        themes: ['dark']
    },
    app: {
        // 项目打包目录
        baseURL: process.env.NODE_ENV === 'development' ? '/' : '/',
        head: {
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            title: '语雀导出',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                {
                    name: 'description',
                    content: '语雀，语雀文档导出，语雀文档批量导出，语雀批量导出，wforguo，forguo'
                },
                {
                    name: 'keywords',
                    content: '语雀|语雀文档导出|语雀文档批量导出|语雀批量导出|wforguo|forguo'
                }
            ],
            script: [
                {
                    src: 'https://hm.baidu.com/hm.js?e2b1313ceb93a9a3428404181b004fc1'
                }
            ]
        }
    }
})
