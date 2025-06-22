<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import { useUserStore } from '../stores/user'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useThemeStore } from '../stores/theme' // 引入主题store

// 初始化用户状态
const userStore = useUserStore()
userStore.init()

// 初始化主题状态
const themeStore = useThemeStore()

// 添加滚动监听逻辑
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // 从本地存储加载主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && themeStore.themes.some(t => t.id === savedTheme)) {
    themeStore.setTheme(savedTheme)
    updateBackground(themeStore.currentTheme.background)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
// 动态更新背景样式
const updateBackground = (background: string) => {
  const bgElement = document.querySelector('.layout-container') as HTMLElement
  if (bgElement) {
    bgElement.style.setProperty('--theme-background', background)
  }
}

// 监听主题变化
watch(() => themeStore.currentTheme, (newTheme) => {
  updateBackground(newTheme.background)
}, { immediate: true })
</script>

<template>
  <div class="layout-container">
    <!-- 添加动态class，根据滚动状态改变背景 -->
    <header class="sticky-header" :class="{ 'scrolled': isScrolled }">
      <NavBar />
    </header>
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <slot />
    </main>
    
    <!-- 页脚 -->
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
  width: 100%;
  position: relative; /* 添加相对定位 */
  /* background-color: #ffffff; 保留白色背景 */
  /* 使用 CSS 变量设置背景 */
  --theme-background: radial-gradient(circle at 30% 70%, #fdc3b0, transparent 80%),
                      radial-gradient(circle at 70% 30%, #ffecd2, transparent 80%);
}

/* 新增背景层 */
.layout-container::before {
  content: "";
  position: fixed; /* 固定定位 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1; /* 置于内容下方 */
  background-image: var(--theme-background);
  background-color: #ffffff;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease; /* 添加过渡效果 */
}

/* 滚动时的样式 */
.sticky-header.scrolled {
  background-color: white;
}

.app-footer {
  position: fixed; /* 固定定位 */
  bottom: 0;      /* 紧贴底部 */
  left: 0;        /* 从左到右撑满 */
  right: 0;
  /* padding: 1rem; */
  text-align: center;
  border-top: 1px solid #dee2e6;
  background-color: white; /* 可选：添加背景色避免内容穿透 */
  z-index: 10;    /* 确保 footer 在内容之上 */
}

/* 调整 main-content 的 padding-bottom，避免内容被 footer 遮挡 */
.main-content {
  padding: 0 15rem;
  padding-bottom: 4rem; /* 根据 footer 高度调整 */
  flex: 1;
  /* display: flex; */
}
</style>