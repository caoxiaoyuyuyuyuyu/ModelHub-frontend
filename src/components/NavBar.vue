<script setup lang="ts">
import { ElAvatar, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import { RouterLink } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useThemeStore } from '../stores/theme'
import router from '../router';

const userStore = useUserStore()
const themeStore = useThemeStore()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const changeTheme = (themeId: string) => {
  themeStore.setTheme(themeId)
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <RouterLink to="/" class="logo-link">
        <ElAvatar :size="42" src="/public/ModelHub.png"></ElAvatar>
      </RouterLink>
      <h2>ModelHub</h2>
    </div>
    <ul class="navbar-menu">
      <!-- <li>
        <RouterLink to="/">首页</RouterLink>
      </li>
      <li>
        <RouterLink to="/workspace">工作台</RouterLink>
      </li>
      <li>
        <RouterLink to="/history">对话历史</RouterLink>
      </li>
      <li>
        <RouterLink to="/user">个人中心</RouterLink>
      </li> -->
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
                <!-- 主题切换菜单 -->
                <ElDropdownItem divided>
                  <div class="theme-selector">
                    <span class="theme-label">主题颜色</span>
                    <div class="theme-colors">
                      <div 
                        v-for="theme in themeStore.themes" 
                        :key="theme.id"
                        class="theme-color"
                        :class="{ active: theme.id === themeStore.currentThemeId }"
                        :style="{ background: theme.background }"
                        @click="changeTheme(theme.id)"
                      ></div>
                    </div>
                  </div>
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
  padding: 0.8rem 2rem;
  height: 100%; /* 填满父容器高度 */
  /* max-width: 1600px; */
  margin: 0 auto;
}

.navbar-brand { 
  display: flex;
  align-items: center;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 1rem;
  width: min-content;
}
.navbar-brand >h2 { 
  margin: 0;
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
  z-index: 1100; /* 高于导航栏 */
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

.theme-selector {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 0;
}

.theme-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.theme-colors {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.theme-color {
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #ebeef5;
  transition: transform 0.2s;
}

.theme-color:hover {
  transform: scale(1.05);
}

.theme-color.active {
  box-shadow: 0 0 0 2px #409eff;
  position: relative;
}

.theme-color.active::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  text-shadow: 0 0 2px rgba(0,0,0,0.5);
}
</style>