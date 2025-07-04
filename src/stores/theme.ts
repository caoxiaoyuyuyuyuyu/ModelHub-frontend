import { defineStore } from 'pinia'

// 定义主题类型
export type Theme = {
  id: string
  name: string
  background: string
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    // 可用主题列表
    themes: [
      {
        id: 'default',
        name: '默认主题',
        background: `
          radial-gradient(circle at 30% 70%, #fdc3b0, transparent 80%),
          radial-gradient(circle at 70% 30%, #ffecd2, transparent 80%)
        `
      },
      {
        id: 'blue',
        name: '蓝色主题',
        background: `
          radial-gradient(circle at 30% 70%, #a1c4fd, transparent 80%),
          radial-gradient(circle at 70% 30%, #c2e9fb, transparent 80%)
        `
      },
      {
        id: 'green',
        name: '绿色主题',
        background: `
          radial-gradient(circle at 30% 70%,rgb(101, 158, 109), transparent 80%),
          radial-gradient(circle at 70% 30%,rgb(204, 253, 200), transparent 80%)
        `
      },
      {
        id: 'purple',
        name: '紫色主题',
        background: `
          radial-gradient(circle at 30% 70%, #d299c2, transparent 80%),
          radial-gradient(circle at 70% 30%, #fef6d4, transparent 80%)
        `
      },
      {
        id: 'pure-white',
        name: '纯白主题',
        background: '#ffffff',  // 白色
        type: 'color' // 添加类型标识
      },
      {
        id: 'pure-black',
        name: '纯黑主题',
        background: '#000000',  // 黑色
        type: 'color' // 添加类型标识
      },
      {
        id: 'sky-blue',
        name: '天蓝主题',
        background: '#87CEEB',  // 天蓝色
        type: 'color' // 添加类型标识
      },
      {
        id: 'forest-green',
        name: '森林绿主题',
        background: '#b6eab6',  // 森林绿
        type: 'color' // 添加类型标识
      }
    ] as Theme[],
    // 当前选中的主题ID
    currentThemeId: 'default'
  }),
  getters: {
    currentTheme(): Theme {
      return this.themes.find(t => t.id === this.currentThemeId) || this.themes[0]
    }
  },
  actions: {
    setTheme(themeId: string) {
      this.currentThemeId = themeId
      // 保存到本地存储
      localStorage.setItem('theme', themeId)
    }
  }
})