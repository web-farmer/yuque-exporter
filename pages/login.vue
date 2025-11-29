<!--
 * @Name: home.vue
 * @Author: wei
 * @Date: 2023/3/14 13:59
 * @Description: home
-->
<template>
    <div class="page login-page">
        <el-card style="width: 420px; margin-bottom: 200px">
            <template #header>
                <div class="card-header">
                    <span>欢迎使用</span>
                    <el-link type="primary" href="https://www.yuque.com/yuque/developer/api#785a3731" target="_blank">
                        获取token
                    </el-link>
                </div>
            </template>
            <el-form :model="form">
                <el-form-item>
                    <el-input v-model="form.token" placeholder="请输入token并登录" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button style="width: 100%" type="primary" @click="login">登录</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-link type="primary" href="https://github.com/web-farmer/yuque-exporter/blob/master/README.md" target="_blank">
            GitHub/帮助文档
        </el-link>
    </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'nuxt/app'
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
const router = useRouter()

const form = reactive({
    token: ''
})

// 登录
const login = () => {
    // 保存token到storage
    const token: any = form.token || import.meta.env.VITE_TOKEN || ''
    if (!token) {
        ElMessage.warning('token不能为空')
        return
    }
    window.localStorage.setItem('yuque_token', token)
    router.push({
        path: '/'
    })
}
</script>
<style lang="scss">
.login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}
</style>
