<template>
    <el-container v-show="!loading" v-loading="loading">
        <el-header v-if="route.name !== 'login'">
            <div style="display: flex; align-items: center">
                <span>语雀批量导出</span>
                <a
                    href="https://github.com/web-farmer/yuque-exporter"
                    title="GitHub"
                    target="_blank"
                    class="iconfont icon-github"
                ></a>
            </div>
            <template v-if="route.name !== 'login'">
                <el-button type="warning" link @click="login">退出</el-button>
            </template>
        </el-header>
        <el-main>
            <div class="el-page-main">
                <NuxtPage />
            </div>
        </el-main>
    </el-container>
</template>
<script setup lang="ts">
import 'normalize.css/normalize.css'
import { useRoute, useRouter } from 'nuxt/app'
import { onBeforeMount, ref } from 'vue'
const route = useRoute()
const router = useRouter()
const loading = ref<boolean>(true)

onBeforeMount(() => {
    const token = window.localStorage.getItem('yuque_token')
    console.log(token)
    if (!token) {
        router.push({
            path: 'login'
        })
        loading.value = false
    } else {
        loading.value = false
    }
})

// 退出登录
const login = () => {
    // 清空token
    window.localStorage.setItem('yuque_token', '')
    router.push({
        path: 'login'
    })
}
</script>
<style>
html {
    width: 100%;
    height: 100%;
}
body {
    width: 100%;
    height: 100%;
    --vp-main-max-width: 1366px;
    --vp-main-min-width: 768px;
}
.page {
    width: 100%;
    height: 100%;
}
</style>
<style scoped lang="scss">
.el-container {
    width: 100%;
    height: 100vh;
    overflow: hidden;
}
.el-header {
    height: auto;
    padding: 18px 32px;
    border-bottom: 1px solid rgba(60, 60, 60, 0.12);
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.el-page-main {
    height: 100%;
    margin: 0 auto;
    max-width: var(--vp-main-max-width);
    min-width: var(--vp-main-min-width);
}

.iconfont {
    display: inline-block;
    width: 1.6rem;
    height: 1.6rem;
    font-size: 1.3rem;
    position: relative;
    margin: 0 5px;
    opacity: 0.8;
    transition: ease all 300ms;
}
.iconfont:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
}
.iconfont:hover {
    opacity: 1;
    text-decoration: underline;
    transition: ease all 300ms;
}

.icon-github:before {
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYEAYAAACw5+G7AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAAASAAAAEgARslrPgAABYZJREFUWMPtV11Ik30UP+dxWdKGMvvQLrIr00XTtA+oiUWtyBbzUQbSUi/UwphFaR83kUJUaASZzjIvYjdCQ/fYxKxVVJhBtHQu9SIJlcqsiQXT1G3PeS/ms14cT4tawQvv7+aB/zn/c36/8/86D8B/HBimMKglLWkpJQUVqEBFejoa0YjGZcsEDzpCR+iIy0UDNEADdnsbtmEbOhzzVvprAtQOtUPtWLpUminNlGaWldFdukt3S0uxGquxevXqn41Dp+gUnRodxRmcwRmj0S13y93yujpbii3FljI1FXYB7C52F7srMxMyIAMybt2CXuiF3jVrfrVyQUiFVEgdHsZYjMXYwsJWQ6uh1fD0aahpESGJV7AVbEVeHgzBEAy1tsIUTMFUbGzYiAv4CB/hY0wMdEM3dOv1ij2KPYo9b94M9gz2DPb094tNY0JVnI7TcTpuMkE8xEN8ZCSMwAiMvHsHR+EoHJ2c/G3idrCD3e2GKIiCqIkJIQ/1Uz/1m0zaB9oH2gcZGT8tQNjjwlZBAxrQsGhRwKEXeqHXYJgpmSmZKYmPh3EYh/HSUjKSkYz9/dRCLdRy5w5EQzREX78e+DZCIzRyHCyGxbB4cNAf/8QJt9VtdVvj4tCBDnSUlATyzAthnjHPmGcmU4DXAgSdATaGjWFjzpyBHbADdly8GCS5ERqhMT3dstyy3LL81avfXgEh72f2M/s5LQ0OwSE4ZLcvtJOb3OQ+fZqzcTbOVl0tsgKIwq0ilohc5CLXqlXhIh6I+5Ae0sOVK8XsqEIVqgReGCh8QEBuQ25DbkNqquh1OA7jMO5wTCZNJk0mdXaGWwCXx+VxeZ2dcBkuw+Xu7iCH+VuPtbJW1qpUBgnw1fpqfbVpaaIV2kpbaeuNG0/wCT5BrzfcAuazEK7FtbjWZBLz4DW8htds2BAkAFSgAtWKFaKha6iGasbG/gzxfxF08k7e+f69mJ15zDxmHn/fagEBeAAP4AGe/3H4mJg/LQCHcAiH5HIxO12gC3The+sRECD0KqLKLzGXmEvi93G4QDKSkWzLFlH7fbpP9z99ChLgP7wvX4pGboM2aDt40N+0hbGFmIdOp9PpdHFxmI3ZmK3XixbyJHOSOfmdZ0CAUqPUKDVOp9BkBc0UHpbDzGHm8L17WpVWpVUpFL9LPDctNy03LSnJG+GN8EY8euR/f6Kjgxyd4ATnyIiyRlmjrBkYCBJQhVVYhTyPe3Ev7m1oEMapiZqoqakJd+JO3FlQAImQCIkJCdiBHdjhdPofvvZ2tpltZpsrKvyVjAjqsc7ROTpHDJOTn5Ofk19ezp5nz7PnrVZezst5+evXMAuzMJucLKr0JtyEmw0NAk9hWLLQT6KWqCXqq1e9Cd4Eb0JxMRZjMRYXF8MojMJoXx+to3W0rqDA793c7K/Yvn3+nubDB7PZbDabfb6FcYXErJf1st7ERNCBDnQaDchABrIfLFEXdEHX27cSiUQikdTWBm2phQN+At++UREVUVF+PmyDbbBtdpZ6qId6Kis9E54Jz4TNRlmURVnr12MVVmGVWu3L9mX7ssvLQ20ZXIJLcMlPtCDzecEDHvAUFgq8QgoQwCVzyVzy8+f+CuTnw2bYDJul0si6yLrIOrsdK7ESK/PyIAuyICsxEYdxGIdDH25+mp/mpz0eUYcxGIOxuTnqoz7qKyiwfLF8sXzp6hJzFxUgwMJZOAtnNoMUpCDdvRvUoAY1w2A91mP92bO0iTbRpvp60IMe9OnpISsrhvkfGiEPZ+JMnOn27VDTfv2XUiKVSCXHjsF22A7bi4qYr8xX5mtZWctcy1zLXEeH2HztC+0L7Yv9+5koJoqJunIFXOACV1OTR+aReWTXrrVvbN/YvnF6+pcL8T/+Mv4BjEZ0W2RcK7UAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjAtMDktMjBUMTY6NDM6MjMrMDg6MDDWnqjNAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIwLTA5LTIwVDE2OjQzOjIzKzA4OjAwp8MQcQAAAEt0RVh0c3ZnOmJhc2UtdXJpAGZpbGU6Ly8vaG9tZS9hZG1pbi9pY29uLWZvbnQvdG1wL2ljb25fMzd2a2ZtMWJ4NDkvaHVhYmFuODguc3ZnZhs8BQAAAABJRU5ErkJggg==')
        no-repeat 50% 50%;
}
</style>
