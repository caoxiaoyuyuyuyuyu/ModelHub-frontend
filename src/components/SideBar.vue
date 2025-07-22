<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
const activeItem = ref('')

const setActiveItem = (item: string) => {
  activeItem.value = item
}

const menuItems = [
  { id: 'dashboard', name: '首页', icon: '🏠', path: '/' },
  { id: 'workspace', name: '工作台', icon: '💼', path: '/workspace' },
  { id: 'history', name: '对话历史', icon: '🕒', path: '/history' },
  { id: 'user', name: '个人中心', icon: '👤', path: '/user' },
  { id: 'permission', name: '权限管理', icon: '⚙️', path: '/permission' },
]
</script>

<template>
  <div class="sidebar-container">
    <!-- 菜单项 -->
    <ul class="sidebar-menu">
      <li v-for="item in menuItems" style="height: 80px;" :key="item.id">
        <RouterLink 
          :to="item.path" 
          class="menu-item"
          :class="{ active: activeItem === item.id }"
          @click="setActiveItem(item.id)"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span class="menu-text">{{ item.name }}</span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  padding-top: 0.5rem; /* 顶部内边距 */
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  margin-bottom: 4px;
}

.menu-item {
  height: 80px;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #495057;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: #e9ecef;
}

.menu-item.active {
  background-color: #e7f1ff;
  color: #1e6fdb;
  font-weight: 500;
}

.menu-icon {
  font-size: 20px;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.menu-text {
  font-size: 1.1rem;
}
</style>