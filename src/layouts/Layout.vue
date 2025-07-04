<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import SideBar from '@/components/SideBar.vue'
import { useUserStore } from '../stores/user'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useThemeStore } from '../stores/theme'

const isSidebarVisible = ref(true)

const userStore = useUserStore()
userStore.init()

const themeStore = useThemeStore()
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && themeStore.themes.some(t => t.id === savedTheme)) {
    themeStore.setTheme(savedTheme)
    updateBackground(themeStore.currentTheme.background)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const updateBackground = (background: string) => {
  const bgElement = document.querySelector('.content-container') as HTMLElement
  if (bgElement) {
    // 检测是否是纯色（不包含"gradient"关键词）
    if (!background.includes('gradient')) {
      bgElement.style.setProperty('--theme-background-color', background)
      bgElement.style.setProperty('--theme-background-image', 'none')
    } else {
      bgElement.style.setProperty('--theme-background-image', background)
      bgElement.style.setProperty('--theme-background-color', '#ffffff')
    }
  }
}

watch(() => themeStore.currentTheme, (newTheme) => {
  updateBackground(newTheme.background)
}, { immediate: true })
</script>

<template>
  <div class="layout-container">
    <!-- 顶部导航栏 - 固定位置 -->
    <header class="sticky-header" :class="{ 'scrolled': isScrolled }">
      <NavBar />
    </header>

    <!-- 主体布局 - 包含侧边栏和内容 -->
    <div class="main-layout">
      <!-- 左侧边栏 - 固定位置 -->
      <SideBar v-if="isSidebarVisible" class="sidebar" />
      
      <!-- 右侧内容区域 - 可滚动 -->
      <div class="content-container">
        <main class="main-content">
          <slot />
        </main>
        
        <!-- 页脚 -->
        <!-- <footer class="app-footer">
          <p>&copy; 2025 ModelHub. All rights reserved.</p>
        </footer> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  position: relative;
}

.layout-container::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  background-color: #fff;
}

.sticky-header {
  position: fixed; /* 固定定位 */
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* 最高层级 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #f9fafd;
}

/* 主布局 - 侧边栏 + 内容区域 */
.main-layout {
  display: flex;
  position: fixed;
  top: 85px; /* 紧接导航栏下方 */
  left: 0;
  right: 0;
  bottom: 0; /* 填满剩余空间 */
  z-index: 90;
}

/* 侧边栏样式 - 固定位置 */
.sidebar {
  width: 240px;
  background-color: #f9fafd;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  height: 100%; /* 填满高度 */
  overflow-y: auto; /* 允许侧边栏内容滚动 */
  position: relative; /* 相对定位 */
  z-index: 95;
}

/* 内容容器 */
.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 85px); /* 确保最小高度填满可视区域 */
  padding: 0;
  overflow-y: auto;
  position: relative;
  background-color: transparent; /* 确保背景透明 */
}

.content-container::before {
  content: "";
  position: fixed; /* 改为fixed定位 */
  top: 85px; /* 与header高度一致 */
  left: 240px; /* 与sidebar宽度一致 */
  right: 0;
  bottom: 0;
  z-index: -1;
  background-image: var(--theme-background-image);
  background-color: var(--theme-background-color, #ffffff);
}


.app-footer {
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #dee2e6;
  background-color: white;
  z-index: 10;
  margin-top: auto;
}

.main-content {
  padding: 2rem;
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .sidebar {
    display: none;
  }
  
  .content-container {
    width: 100%;
  }
  
  .main-content {
    padding: 1.5rem;
  }
}
</style>