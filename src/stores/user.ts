// stores/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import api from '../utils/api'

interface User {
  id: string
  name: string
  email: string
  avatar: string
}

export const useUserStore = defineStore('user', () => {
  const router = useRouter()
  
  // 用户信息
  const user = ref<User | null>(null)
  
  // 认证 token
  const token = ref<string | null>(null)
  
  // 登录状态
  const isAuthenticated = ref(false)
  
  // 登录方法
  async function login(email: string, password: string) {
    try {
      const response = await api.post('/user/login', { email, password })

      const data = response.data.data
      
      user.value = {
          id: data.id,
          name: data.name,
          email: data.email,
          avatar: ("http://localhost:5000/user/avatar/" + data.avatar) || '/public/vite.svg',
      }
      token.value = data.token
      isAuthenticated.value = true
      
      // 保存到本地存储
      localStorage.setItem('user', JSON.stringify(user.value))
      localStorage.setItem('token', data.token)
      localStorage.setItem('isAuthenticated', 'true')
      
      ElNotification.success({
        title: '登录成功',
        message: `欢迎回来，${data.name}！`
      })
      
      return true
      
    } catch (error: any) {
      ElNotification.error({
        title: '登录失败',
        message: error.response?.data.data?.message || '邮箱或密码不正确'
      })
      return false
    }
  }
    
  async function register(name: string, email: string, password: string) {
    try {
      const response = await api.post('/user/register', { name, email, password })
      if (response.status === 200 && response.data.data) {
      
        const data = response.data.data
        
        // user.value = {
        //     id: data.id,
        //     name: data.name,
        //     email: data.email,
        //     avatar: data.avatar || '/public/vue.svg',
        // }
        // token.value = data.token
        // isAuthenticated.value = true
        
        // // 保存到本地存储
        // localStorage.setItem('user', JSON.stringify(user.value))
        // localStorage.setItem('token', data.token)
        // localStorage.setItem('isAuthenticated', 'true')
        ElNotification.success({
            title: '注册成功',
            message: `欢迎加入，${data.name}！`
        })
        
        router.push('/login')
        
        return true
      }else {
        // 处理业务逻辑失败
        const errorMsg = response.data.message || '注册失败'
        ElNotification.error({
            title: '注册失败',
            message: errorMsg || '注册过程中出现问题'
        })
        return false
      }
    } catch (error: any) {
      ElNotification.error({
        title: '注册失败',
        message: error.response?.data?.message || '注册过程中出现问题'
      })
      return false
    }
  }
  
  function logout() {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('isAuthenticated')
    
    // router.push('/login')
  }
  
  function init() {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    const storedAuth = localStorage.getItem('isAuthenticated')
    
    if (storedUser && storedToken && storedAuth === 'true') {
      user.value = JSON.parse(storedUser)
      token.value = storedToken
      isAuthenticated.value = true
    }
  }
  
  function getToken() {
    return token.value
  }

  function updateUserAvatar(avatar: string) {
    if (user.value) {
      user.value.avatar = ("http://localhost:5000/user/avatar/" + avatar) || '/public/vite.svg';
    }
  }
  
  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    init,
    getToken,
    updateUserAvatar
  }
})