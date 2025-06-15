// utils/api.ts
import axios from 'axios'
import { useUserStore } from '../stores/user'
import router from '../router' // 引入路由实例

// 创建 axios 实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加认证 token
api.interceptors.request.use(config => {
  const userStore = useUserStore()
  const token = userStore.getToken()
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器 - 处理认证错误
api.interceptors.response.use(response => {
  return response
}, error => {
  if (error.response && error.response.status === 401) {
    // 401 Unauthorized - 清除用户状态并重定向到登录页
    const userStore = useUserStore()
    userStore.logout()
    
    // 使用 Vue Router 进行重定向，而不是直接操作 window.location
    // router.push({
    // path: '/login',
    // query: { reason: 'session_expired' }
    // })
  }
  
  return Promise.reject(error)
})

export default api