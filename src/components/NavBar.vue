<script setup lang="ts">
import { ElAvatar, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import { RouterLink } from 'vue-router'
import { useUserStore } from '../stores/user'
import router from '../router';

const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <RouterLink to="/" class="logo-link">
        <ElAvatar :size="42" src="/public/vite.svg"></ElAvatar>
      </RouterLink>
    </div>
    <ul class="navbar-menu">
      <li>
        <RouterLink to="/">首页</RouterLink>
      </li>
      <li>
        <RouterLink to="/workspace">工作台</RouterLink>
      </li>
      <li>
        <RouterLink to="/history">对话历史</RouterLink>
      </li>
      <li>
        <RouterLink to="/about">关于</RouterLink>
      </li>
      <div class="navbar-right">
        <template v-if="userStore.isAuthenticated">
          <ElDropdown>
            <ElAvatar :size="42" :src="userStore.user?.avatar"></ElAvatar>
            <template #dropdown>
              <ElDropdownMenu class="avatar-dropdown">
                <div class="dropdown-header">
                  <div class="dropdown-title">邮箱</div>
                  <div class="dropdown-subtitle">{{ userStore.user?.email }}</div>
                </div>
                <ElDropdownItem>
                  <span class="dropdown-item-text">消息通知</span>
                  <span class="dropdown-item-icon">✉️</span>
                </ElDropdownItem>
                <ElDropdownItem>
                  <span class="dropdown-item-text">开发者论坛</span>
                  <span class="dropdown-item-icon">🗨️</span>
                </ElDropdownItem>
                <ElDropdownItem>
                  <span class="dropdown-item-text">服务协议</span>
                  <span class="dropdown-item-icon">📄</span>
                </ElDropdownItem>
                <ElDropdownItem divided @click="handleLogout">
                  <span class="dropdown-item-text logout">退出登录</span>
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </template>
        <template v-else>
          <div class="auth-buttons">
            <RouterLink to="/login" class="login-button">登录</RouterLink>
          </div>
        </template>
      </div>
    </ul>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  margin: 0 2rem;
  align-items: flex-end;
}

.navbar-menu {
  display: flex;
  list-style: none;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
  align-items: center;
}

.navbar-menu a {
  text-decoration: none;
  color: #2c3e50;
  font-weight: 500;
  font-size: 1.1rem;
}

.navbar-menu a.router-link-exact-active {
  color: #4277b9;
}

.logo-link {
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: #2c3e50;
}

.navbar-right {
  /* margin-left: 1.5rem; */
}

.avatar-dropdown{
  width: 360px;
}

:deep(.dropdown-header) {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.dropdown-title) {
  font-weight: 600;
  font-size: 14px;
}

:deep(.dropdown-subtitle) {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
}

:deep(.dropdown-item-text) {
  font-size: 18px;
}

:deep(.dropdown-item-icon) {
  font-size: 14px;
  opacity: 0.7;
}

:deep(.logout) {
  color: #f56c6c;
}

:deep(.el-dropdown-menu__item--divided) {
  margin-top: 6px;
  border-top: 1px solid #f0f0f0;
}

/* 新增登录注册按钮样式 */
.auth-buttons {
  display: flex;
  gap: 12px;
  margin-left: 20px;
}

.login-button {
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.login-button {
  color: #4277b9;
  border: 1px solid #4277b9;
}

.login-button:hover {
  background-color: #ecf5ff;
}
</style>