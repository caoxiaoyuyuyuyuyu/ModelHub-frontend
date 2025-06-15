<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import { useUserStore } from '../stores/user'

// 初始化用户状态
const userStore = useUserStore()
userStore.init()
</script>

<template>
  <div class="layout-container">
    <!-- 吸顶导航栏 -->
    <header class="sticky-header">
      <NavBar />
    </header>
    
    <!-- 主要内容区域 - 使用 slot 接收内容 -->
    <main class="main-content">
      <slot />
    </main>
    
    <!-- 页脚 (可选) -->
    <footer class="app-footer">
      <p>&copy; 2025 ModelHub. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  /* width: 1280px; */
  width: 100%;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.main-content {
  padding: 0 10rem;
  display: flex;
  flex: 1;
}

.app-footer {
  padding: 1rem;
  text-align: center;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}
</style>