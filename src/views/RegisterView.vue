<!-- views/RegisterView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElNotification } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeTerms = ref(false)
const loading = ref(false)

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    ElNotification({
      title: '错误',
      message: '请填写所有必填字段',
      type: 'error'
    })
    return
  }
  
  if (password.value !== confirmPassword.value) {
    ElNotification({
      title: '错误',
      message: '两次输入的密码不一致',
      type: 'error'
    })
    return
  }
  
  if (!agreeTerms.value) {
    ElNotification({
      title: '错误',
      message: '请同意服务条款和隐私政策',
      type: 'error'
    })
    return
  }
  
  loading.value = true
  try {
    const success = await userStore.register(name.value, email.value, password.value)
    if (success) {
      // console.log(success)
      // ElNotification({
      //   title: '注册成功',
      //   message: `欢迎加入，${name.value}！`,
      //   type: 'success'
      // })
      
      // 检查是否有重定向路径
      const redirect = router.currentRoute.value.query.redirect
      if (typeof redirect === 'string') {
        router.push(redirect)
      } else {
        router.push('/')
      }
    }
  } catch (error) {
    // ElNotification({
    //   title: '注册失败',
    //   message: '注册过程中出现问题，请稍后重试',
    //   type: 'error'
    // })
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <ElAvatar :size="64" src="/public/vite.svg" />
        <h2>创建账号</h2>
        <p>加入我们的平台</p>
      </div>
      
      <div class="auth-form">
        <div class="form-group">
          <label>姓名</label>
          <ElInput
            v-model="name"
            placeholder="请输入您的姓名"
            size="large"
            required
          />
        </div>
        
        <div class="form-group">
          <label>邮箱</label>
          <ElInput
            v-model="email"
            placeholder="请输入邮箱"
            size="large"
            required
          />
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <ElInput
            v-model="password"
            type="password"
            placeholder="至少8位字符"
            size="large"
            show-password
            required
          />
        </div>
        
        <div class="form-group">
          <label>确认密码</label>
          <ElInput
            v-model="confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            size="large"
            show-password
            required
          />
        </div>
        
        <div class="form-options">
          <ElCheckbox v-model="agreeTerms">
            我同意 <router-link to="/terms" class="terms-link">服务条款</router-link> 和 <router-link to="/privacy" class="terms-link">隐私政策</router-link>
          </ElCheckbox>
        </div>
        
        <ElButton
          type="primary"
          size="large"
          @click="handleRegister"
          :loading="loading"
          class="auth-button"
        >
          注册
        </ElButton>
        
        <div class="auth-divider">
          <span>已有账号?</span>
        </div>
        
        <ElButton
          plain
          size="large"
          @click="goToLogin"
          class="auth-button"
        >
          登录现有账号
        </ElButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 原有样式... */
.auth-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  /* min-height: 100vh; */
  height: calc(var(--vh, 1vh) * 100 - 280px);
  padding: 2rem;
}

.auth-card {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  padding: 2.5rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h2 {
  margin: 1rem 0 0.5rem;
  font-size: 1.5rem;
  color: #303133;
}

.auth-header p {
  margin: 0;
  color: #909399;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #606266;
  font-weight: 500;
  text-align: left;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.forgot-password {
  color: #4277b9;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password:hover {
  text-decoration: underline;
}

.auth-button {
  width: 100%;
  /* margin-bottom: 1rem; */
}

.auth-divider {
  position: relative;
  text-align: center;
  /* margin: 1.5rem 0; */
}

.auth-divider span {
  position: relative;
  padding: 0 1rem;
  background: white;
  color: #909399;
  font-size: 0.9rem;
}

.auth-divider:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #dcdfe6;
  z-index: -1;
}

/* 新增警告样式 */
.auth-alert {
  margin-top: 1rem;
  max-width: 100%;
}

:deep(.el-alert) {
  padding: 8px 16px;
}
.terms-link {
  color: #4277b9;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}
</style>